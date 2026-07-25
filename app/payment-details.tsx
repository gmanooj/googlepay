import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  useColorScheme,
  StatusBar,
  ScrollView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BANKS_LIST } from './add-bank';

const PERSON_IMAGE_MAP: { [key: string]: any } = {
  'tn_m1': require('@/assets/images/male1.jpg'),
  'tn_f1': require('@/assets/images/female1.jpg'),
  'tn_m2': require('@/assets/images/male2.jpg'),
  'ap_f1': require('@/assets/images/female2.png'),
  'ap_m1': require('@/assets/images/male3.png'),
  'ka_f1': require('@/assets/images/female3.png'),
  'kl_f1': require('@/assets/images/female4.png'),
  'b_jio': require('@/assets/images/jio.png'),
  'b_dominos': require('@/assets/images/dominos.png'),
};

export default function PaymentDetailsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const router = useRouter();
  const params = useLocalSearchParams();

  const recipientName = (params.recipientName as string) || 'Recipient';
  const recipientUpiId = (params.recipientUpiId as string) || 'recipient@okaxis';
  const recipientImage = params.recipientImage as string;
  const amount = (params.amount as string) || '0';
  const dateStr = (params.date as string) || new Date().toISOString();
  const fromBankName = (params.fromBankName as string) || 'State Bank of India';
  const transactionType = (params.type as string) || 'person';

  const [senderName, setSenderName] = useState('Manoj Ganesan');
  const [senderUpiId, setSenderUpiId] = useState('gmanooj1@okaxis');
  const [timelineExpanded, setTimelineExpanded] = useState(true);

  const themeBg = isDark ? '#121212' : '#ffffff';
  const themeTextColor = isDark ? '#ffffff' : '#202124';
  const themeSubText = isDark ? '#9aa0a6' : '#5f6368';
  const themeBorder = isDark ? '#3c4043' : '#dadce0';
  const themeCardBg = isDark ? '#202124' : '#ffffff';

  useEffect(() => {
    async function loadSenderInfo() {
      try {
        const storedName = await AsyncStorage.getItem('user_name');
        const storedUpi = await AsyncStorage.getItem('active_upi_id');
        if (storedName) setSenderName(storedName);
        if (storedUpi) setSenderUpiId(storedUpi);
      } catch (err) {
        console.error('Failed to load sender info:', err);
      }
    }
    loadSenderInfo();
  }, []);

  // Format date: e.g. 17 Jul 2026, 4:28 pm
  const formatReceiptDate = (isoStr: string) => {
    const date = new Date(isoStr);
    const day = date.getDate();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const minStr = minutes < 10 ? '0' + minutes : minutes;
    
    return `${day} ${month} ${year}, ${hours}:${minStr} ${ampm}`;
  };

  // Format time inside timeline (e.g. 4:28 pm)
  const formatCardTime = (isoStr: string) => {
    const date = new Date(isoStr);
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const minStr = minutes < 10 ? '0' + minutes : minutes;
    return `${hours}:${minStr} ${ampm}`;
  };

  // Generate deterministic UPI transaction ID based on params
  const getUpiTxnId = (idParam: string) => {
    if (!idParam) return '656496970994';
    let hash = 0;
    for (let i = 0; i < idParam.length; i++) {
      hash = idParam.charCodeAt(i) + ((hash << 5) - hash);
    }
    return (600000000000 + (Math.abs(hash) % 400000000000)).toString();
  };

  // Generate deterministic Google transaction ID
  const getGoogleTxnId = (idParam: string) => {
    if (!idParam) return 'CICAgLj4_fDxVw';
    let hash = 0;
    for (let i = 0; i < idParam.length; i++) {
      hash = idParam.charCodeAt(i) + ((hash << 5) - hash);
    }
    const suffix = Math.abs(hash).toString(36).substring(0, 8);
    return `CICAg${suffix}_fDxVw`;
  };

  // Mask bank account digits deterministically
  const getBankAccDigits = (bankName: string) => {
    if (bankName.includes('State Bank') || bankName.includes('SBI')) return '6028';
    if (bankName.includes('HDFC')) return '4890';
    if (bankName.includes('ICICI')) return '7122';
    return '1234';
  };

  // Helper to format phone number
  const getPhoneNumber = (name: string) => {
    if (name.toLowerCase().includes('jannath')) {
      return '+91 ••••• •4139';
    }
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const digits = (Math.abs(hash) % 9000 + 1000).toString();
    return `+91 ••••• •${digits}`;
  };

  // Helper to generate banking name
  const getBankingName = (name: string) => {
    if (name.toLowerCase().includes('jannath')) {
      return 'JANNATH NISHA SHAHUL HAMEED';
    }
    return name.toUpperCase();
  };

  // Resolve bank logo using img.logo.dev API wrapped in GPay-style outer box
  const renderBankLogo = (bankName: string) => {
    const bankDetail = BANKS_LIST.find(b => b.name === bankName || b.shortName === bankName);
    
    return (
      <View style={styles.bankLogoOuterBox}>
        {bankDetail?.useLocalAsset ? (
          <Image source={bankDetail.localAssetSource} style={styles.logoImage} resizeMode="contain" />
        ) : bankDetail?.domain ? (
          <Image 
            source={{ uri: `https://img.logo.dev/${bankDetail.domain}?token=pk_K5tbWMjaQYadU9Se2KkiXQ` }} 
            style={styles.logoImage} 
            resizeMode="contain" 
          />
        ) : (
          <Ionicons name="card" size={16} color="#5f6368" />
        )}
      </View>
    );
  };

  const handlePayAgainPress = () => {
    router.push({
      pathname: '/pay-amount',
      params: {
        recipientName,
        recipientUpiId,
        recipientImage,
        type: transactionType,
      },
    } as any);
  };

  const hasImage = recipientImage && PERSON_IMAGE_MAP[recipientImage];
  const firstLetter = recipientName.replace('Self: ', '').charAt(0).toUpperCase();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeBg }]} edges={['top', 'left', 'right', 'bottom']}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* TOP HEADER */}
      <View style={styles.topHeader}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={themeTextColor} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.flagBtn}>
          <Ionicons name="flag-outline" size={22} color={themeTextColor} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* AVATAR ROW */}
        <View style={[styles.avatarCircle, { backgroundColor: '#f4511e', overflow: 'hidden' }]}>
          {hasImage ? (
            <Image source={PERSON_IMAGE_MAP[recipientImage]} style={styles.avatarImg} />
          ) : (
            <Text style={styles.avatarInitials}>{firstLetter}</Text>
          )}
        </View>

        {/* PAYEE DETAILS */}
        <Text style={[styles.payeeName, { color: themeTextColor }]}>
          To {recipientName}
        </Text>
        {transactionType === 'person' && (
          <Text style={[styles.payeePhone, { color: themeSubText }]}>
            {getPhoneNumber(recipientName)}
          </Text>
        )}

        {/* AMOUNT */}
        <Text style={[styles.amountText, { color: themeTextColor }]}>
          ₹{parseFloat(amount).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
        </Text>

        {/* PAY AGAIN BUTTON */}
        <TouchableOpacity style={styles.payAgainBtn} onPress={handlePayAgainPress}>
          <Text style={styles.payAgainBtnText}>Pay again</Text>
        </TouchableOpacity>

        {/* COMPLETED STATUS */}
        <View style={styles.statusRow}>
          <Ionicons name="checkmark-circle" size={18} color="#0f9d58" style={{ marginRight: 6 }} />
          <Text style={styles.statusText}>Completed</Text>
        </View>

        {/* TIMESTAMP DIVIDER */}
        <View style={[styles.dividerLine, { backgroundColor: themeBorder }]} />
        <Text style={[styles.timestampText, { color: themeTextColor }]}>
          {formatReceiptDate(dateStr)}
        </Text>

        {/* ROUNDED INFO BOX CARD */}
        <View style={[styles.receiptCard, { backgroundColor: themeCardBg, borderColor: themeBorder }]}>
          {/* Bank Header */}
          <TouchableOpacity 
            style={styles.cardHeaderRow} 
            onPress={() => setTimelineExpanded(!timelineExpanded)}
            activeOpacity={0.7}
          >
            {renderBankLogo(fromBankName)}
            <Text style={[styles.cardHeaderText, { color: themeTextColor }]}>
              {fromBankName} {getBankAccDigits(fromBankName)}
            </Text>
            <Ionicons name={timelineExpanded ? "chevron-up" : "chevron-down"} size={18} color={themeTextColor} style={{ marginLeft: 'auto' }} />
          </TouchableOpacity>

          {timelineExpanded && (
            <>
              <View style={[styles.cardDivider, { backgroundColor: themeBorder }]} />

              {/* PAYMENT TIMELINE */}
              <View style={styles.timelineContainer}>
                {/* Absolute continuous line */}
                <View style={[styles.timelineAbsoluteLine, { backgroundColor: themeBorder }]} />
                
                {/* Step 1: Payment started */}
                <View style={styles.timelineRow}>
                  <View style={styles.timelineLeftCol}>
                    <View style={[styles.timelineDot, { backgroundColor: '#1a73e8' }]} />
                  </View>
                  <View style={styles.timelineRightCol}>
                    <Text style={[styles.timelineStepTitle, { color: themeTextColor }]}>Payment started</Text>
                    <Text style={styles.timelineStepTime}>{formatCardTime(dateStr)}</Text>
                  </View>
                </View>

                {/* Step 2: Amount debited */}
                <View style={styles.timelineRow}>
                  <View style={styles.timelineLeftCol}>
                    <View style={[styles.timelineDot, { backgroundColor: '#1a73e8' }]} />
                  </View>
                  <View style={styles.timelineRightCol}>
                    <Text style={[styles.timelineStepTitle, { color: themeTextColor }]}>₹{amount} was debited</Text>
                    <Text style={styles.timelineStepTime}>{formatCardTime(dateStr)}</Text>
                  </View>
                </View>

                {/* Step 3: Amount sent */}
                <View style={styles.timelineRow}>
                  <View style={styles.timelineLeftCol}>
                    <View style={[styles.timelineDot, { backgroundColor: '#1a73e8' }]} />
                  </View>
                  <View style={styles.timelineRightCol}>
                    <Text style={[styles.timelineStepTitle, { color: themeTextColor }]}>₹{amount} sent to {recipientName}</Text>
                    <Text style={styles.timelineStepTime}>{formatCardTime(dateStr)}</Text>
                  </View>
                </View>

                {/* Step 4: Payment completed */}
                <View style={styles.timelineRow}>
                  <View style={styles.timelineLeftCol}>
                    <View style={styles.timelineSuccessDot}>
                      <Ionicons name="checkmark" size={10} color="#ffffff" />
                    </View>
                  </View>
                  <View style={styles.timelineRightCol}>
                    <Text style={styles.timelineStepCompletedTitle}>Payment completed</Text>
                    <Text style={styles.timelineStepTime}>{formatCardTime(dateStr)}</Text>
                  </View>
                </View>
              </View>
            </>
          )}

          <View style={[styles.cardDivider, { backgroundColor: themeBorder }]} />

          {/* Details List */}
          <View style={styles.detailsList}>
            <View style={styles.detailsGroup}>
              <Text style={styles.detailsLabel}>UPI transaction ID</Text>
              <Text style={[styles.detailsValue, { color: themeTextColor }]}>
                {getUpiTxnId(params.id as string)}
              </Text>
            </View>

            <View style={styles.detailsGroup}>
              <Text style={styles.detailsLabel}>To: {getBankingName(recipientName)}</Text>
              <Text style={[styles.detailsValue, { color: themeTextColor }]}>
                Google Pay • {recipientName.toLowerCase().replace(/[^a-z0-9]/g, '') + '@okaxis'}
              </Text>
            </View>

            <View style={styles.detailsGroup}>
              <Text style={styles.detailsLabel}>From: {senderName} ({fromBankName})</Text>
              <Text style={[styles.detailsValue, { color: themeTextColor }]}>
                Google Pay • {senderUpiId}
              </Text>
            </View>

            <View style={styles.detailsGroup}>
              <Text style={styles.detailsLabel}>Google transaction ID</Text>
              <Text style={[styles.detailsValue, { color: themeTextColor }]}>
                {getGoogleTxnId(params.id as string)}
              </Text>
            </View>
          </View>
        </View>

        {/* BOTTOM OPTION PILL BUTTONS */}
        <View style={styles.bottomButtonsRow}>
          <TouchableOpacity style={[styles.bottomPillBtn, { borderColor: themeBorder, backgroundColor: themeBg }]}>
            <Ionicons name="help-circle-outline" size={16} color="#1a73e8" style={{ marginRight: 6 }} />
            <Text style={[styles.bottomPillBtnText, { color: themeTextColor }]}>Having issues?</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.bottomPillBtn, { borderColor: themeBorder, backgroundColor: themeBg }]}>
            <Ionicons name="share-social-outline" size={16} color="#1a73e8" style={{ marginRight: 6 }} />
            <Text style={[styles.bottomPillBtnText, { color: themeTextColor }]}>Share</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.bottomPillBtn, { borderColor: themeBorder, backgroundColor: themeBg }]}>
            <Ionicons name="people-outline" size={16} color="#1a73e8" style={{ marginRight: 6 }} />
            <Text style={[styles.bottomPillBtnText, { color: themeTextColor }]}>Split expense</Text>
          </TouchableOpacity>
        </View>

        {/* FOOTER BRANDS */}
        <View style={styles.footerSection}>
          <Text style={styles.poweredByText}>POWERED BY</Text>
          <Image 
            source={require('@/assets/images/upi_logo.png')} 
            style={styles.upiLogoImg} 
            resizeMode="contain" 
          />
          
          <View style={styles.gpayLogoRow}>
            <Text style={styles.gpayText}>
              <Text style={{ color: '#4285F4' }}>G </Text>
              <Text style={{ color: '#5f6368' }}>Pay</Text>
            </Text>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    padding: 4,
  },
  flagBtn: {
    marginLeft: 'auto',
    padding: 4,
  },
  scrollContent: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 48,
  },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  avatarInitials: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  payeeName: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  payeePhone: {
    fontSize: 13,
    marginTop: 4,
    textAlign: 'center',
  },
  amountText: {
    fontSize: 48,
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 24,
  },
  payAgainBtn: {
    backgroundColor: '#0a58ca',
    paddingVertical: 12,
    paddingHorizontal: 36,
    borderRadius: 24,
    marginBottom: 24,
  },
  payAgainBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  statusText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0f9d58',
  },
  dividerLine: {
    height: 0.5,
    width: '100%',
    marginBottom: 16,
  },
  timestampText: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 24,
  },
  receiptCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    width: '100%',
    marginBottom: 24,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardHeaderText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 12,
  },
  cardDivider: {
    height: 0.5,
    marginVertical: 12,
  },
  bankLogoOuterBox: {
    borderWidth: 1,
    borderColor: '#dadce0',
    borderRadius: 8,
    padding: 4,
    width: 44,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  timelineContainer: {
    paddingLeft: 8,
    marginVertical: 12,
    position: 'relative',
  },
  timelineAbsoluteLine: {
    position: 'absolute',
    left: 15,
    top: 10,
    bottom: 24,
    width: 2,
  },
  timelineRow: {
    flexDirection: 'row',
  },
  timelineLeftCol: {
    alignItems: 'center',
    marginRight: 16,
    width: 16,
  },
  timelineRightCol: {
    paddingBottom: 20,
    flex: 1,
  },
  timelineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
  },
  timelineSuccessDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#0f9d58',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  timelineStepTitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  timelineStepCompletedTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f9d58',
  },
  timelineStepTime: {
    fontSize: 12,
    color: '#5f6368',
    marginTop: 4,
  },
  detailsList: {
    marginTop: 4,
  },
  detailsGroup: {
    marginBottom: 14,
  },
  detailsLabel: {
    fontSize: 12,
    color: '#5f6368',
    fontWeight: '600',
    marginBottom: 4,
  },
  detailsValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  bottomButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 32,
  },
  bottomPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 10,
    width: '32%',
    justifyContent: 'center',
  },
  bottomPillBtnText: {
    fontSize: 11,
    fontWeight: '600',
  },
  footerSection: {
    alignItems: 'center',
    width: '100%',
    marginTop: 8,
  },
  poweredByText: {
    fontSize: 9,
    color: '#5f6368',
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  upiLogoImg: {
    width: 70,
    height: 20,
    marginTop: 4,
    marginBottom: 16,
  },
  gpayLogoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gpayText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});
