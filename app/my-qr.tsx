import { getApiBaseUrl } from '@/constants/config';
import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  useColorScheme,
  StatusBar,
  Alert,
  ActivityIndicator,
  Modal,
  Platform,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as ImagePicker from 'expo-image-picker';
import Svg, { Path } from 'react-native-svg';

function UpiFooterLogo() {
  return (
    <Svg viewBox="0 0 1024 466" style={{ width: 80, height: 28 }}>
      <Path fill="#70706e" d="M98.1 340.7h6.3l-5.9 24.5c-.9 3.6-.7 6.4.5 8.2 1.2 1.8 3.4 2.7 6.7 2.7 3.2 0 5.9-.9 8-2.7 2.1-1.8 3.5-4.6 4.4-8.2l5.9-24.5h6.4l-6 25.1c-1.3 5.4-3.6 9.5-7 12.2-3.3 2.7-7.7 4.1-13.1 4.1-5.4 0-9.1-1.3-11.1-4s-2.4-6.8-1.1-12.2l6-25.2zm31.4 40.3 10-41.9 19 24.6c.5.7 1 1.4 1.5 2.2.5.8 1 1.7 1.6 2.7l6.7-27.9h5.9l-10 41.8-19.4-25.1-1.5-2.1c-.5-.8-.9-1.5-1.2-2.4l-6.7 28h-5.9zm44.2 0 9.6-40.3h6.4l-9.6 40.3h-6.4z" />
      <Path fill="#70706e" d="M740.7 305.6h-43.9l61-220.3h43.9l-61 220.3zM717.9 92.2c-3-4.2-7.7-6.3-14.1-6.3H462.6l-11.9 43.2h219.4l-12.8 46.1H481.8v-.1h-43.9l-36.4 131.5h43.9l24.4-88.2h197.3c6.2 0 12-2.1 17.4-6.3 5.4-4.2 9-9.4 10.7-15.6l24.4-88.2c1.9-6.6 1.3-11.9-1.7-16.1z" />
      <Path fill="#098041" d="M877.5 85.7 933 196.1 816.3 306.5z" />
      <Path fill="#e97626" d="M838.5 85.7 894 196.1 777.2 306.5z" />
    </Svg>
  );
}

export default function MyQrScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [userName, setUserName] = useState('G Manooj');
  const [upiId, setUpiId] = useState('gmanooj1@oksbi');
  const [bankName, setBankName] = useState('State Bank of India 6028');
  const [qrImageUri, setQrImageUri] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showShareSheet, setShowShareSheet] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const storedPhone = await AsyncStorage.getItem('user_phone') || '6380866053';
        const storedDetails = await AsyncStorage.getItem('user_details');
        if (storedDetails) {
          const parsed = JSON.parse(storedDetails);
          if (parsed.name) setUserName(parsed.name);
        }
        const storedUpi = await AsyncStorage.getItem('user_upi');
        if (storedUpi) {
          setUpiId(storedUpi);
        }
        const storedAccounts = await AsyncStorage.getItem('bank_accounts');
        if (storedAccounts) {
          const accounts = JSON.parse(storedAccounts);
          if (Array.isArray(accounts) && accounts.length > 0) {
            const acc = accounts[0];
            const num = acc.accountNumber ? acc.accountNumber.slice(-4) : '6028';
            setBankName(`${acc.bankName} ${num}`);
            if (acc.upiId) setUpiId(acc.upiId);
          }
        }

        // Check local AsyncStorage for cached QR image
        const localQr = await AsyncStorage.getItem('user_qr_code');
        if (localQr) {
          setQrImageUri(localQr);
        }

        // Fetch live user profile and QR code image from MongoDB database
        const apiHost = getApiBaseUrl();
        const response = await fetch(`${apiHost}/api/get-user-profile?phone=${storedPhone}`);
        const data = await response.json();
        if (data.success && data.user) {
          if (data.user.name) setUserName(data.user.name);
          if (data.user.qrCodeImage) {
            setQrImageUri(data.user.qrCodeImage);
            await AsyncStorage.setItem('user_qr_code', data.user.qrCodeImage);
          }
          if (data.user.bankAccounts && data.user.bankAccounts.length > 0) {
            const defaultAcc = data.user.bankAccounts.find((a: any) => a.isDefault) || data.user.bankAccounts[0];
            const last4 = defaultAcc.accountNumber ? defaultAcc.accountNumber.slice(-4) : '6028';
            setBankName(`${defaultAcc.bankName} ${last4}`);
            if (defaultAcc.upiId) setUpiId(defaultAcc.upiId);
          }
        }
      } catch (e) {
        console.error('Failed to load dynamic QR profile data:', e);
      }
    }
    loadData();
  }, []);

  const firstLetter = userName.charAt(0).toUpperCase();

  const themeBgColor = isDark ? '#121212' : '#ffffff';
  const themeCardBg = isDark ? '#202124' : '#f0f4f9';
  const themeTextColor = isDark ? '#ffffff' : '#202124';
  const themeSubTextColor = isDark ? '#9aa0a6' : '#5f6368';

  const handleCopyUpi = () => {
    Alert.alert('Copied!', `UPI ID (${upiId}) copied to clipboard.`);
  };

  const handleShare = async () => {
    setShowShareSheet(true);
    try {
      if (Platform.OS !== 'web') {
        await Share.share({
          message: `Pay ${userName} using Google Pay / UPI. UPI ID: ${upiId}`,
          title: `Pay ${userName} via Google Pay`,
        });
      }
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const handleUploadQr = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permission Denied', 'Please allow photo gallery access to upload a QR code.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setUploading(true);
        const asset = result.assets[0];
        const imageUri = asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : asset.uri;

        // 1. Update state & AsyncStorage
        setQrImageUri(imageUri);
        await AsyncStorage.setItem('user_qr_code', imageUri);

        // 2. Upload to MongoDB Backend API
        const storedPhone = await AsyncStorage.getItem('user_phone') || '6380866053';
        const apiHost = getApiBaseUrl();

        const uploadRes = await fetch(`${apiHost}/api/upload-qr`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phone: storedPhone,
            qrCodeImage: imageUri,
          }),
        });
        const uploadData = await uploadRes.json();
        setUploading(false);

        if (uploadData.success) {
          Alert.alert('QR Code Uploaded', 'Your custom QR code has been saved to your profile.');
        } else {
          Alert.alert('Saved Locally', 'QR Code saved to device.');
        }
      }
    } catch (e) {
      setUploading(false);
      console.error('Error uploading QR image:', e);
      Alert.alert('Error', 'Failed to upload image. Please try again.');
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: themeBgColor }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* TOP NAV BAR */}
      <View style={styles.topNavRow}>
        <TouchableOpacity style={styles.navIconButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={themeTextColor} />
        </TouchableOpacity>

        <View style={styles.topRightNav}>
          {/* DOWNLOAD ICON */}
          <TouchableOpacity 
            style={styles.navIconButton} 
            onPress={() => Alert.alert('Downloaded', 'QR Code saved to gallery.')}
          >
            <Ionicons name="download-outline" size={24} color={themeTextColor} />
          </TouchableOpacity>

          {/* 3 DOTS MENU ICON */}
          <TouchableOpacity 
            style={styles.navIconButton} 
            onPress={() => setShowMenu(true)}
          >
            <Ionicons name="ellipsis-vertical" size={22} color={themeTextColor} />
          </TouchableOpacity>
        </View>
      </View>

      {/* 3-DOTS OPTIONS DROPDOWN MENU MODAL */}
      <Modal
        visible={showMenu}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowMenu(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowMenu(false)}
        >
          <View style={[styles.menuContainer, { backgroundColor: isDark ? '#202124' : '#ffffff' }]}>
            {/* Option 1: Upload QR code */}
            <TouchableOpacity 
              style={styles.menuItem} 
              onPress={() => {
                setShowMenu(false);
                handleUploadQr();
              }}
            >
              <Ionicons name="cloud-upload-outline" size={20} color="#0b57d0" style={styles.menuIcon} />
              <Text style={[styles.menuText, { color: themeTextColor }]}>Upload a QR code</Text>
            </TouchableOpacity>

            {/* Option 2: Download QR code */}
            <TouchableOpacity 
              style={styles.menuItem} 
              onPress={() => {
                setShowMenu(false);
                Alert.alert('Downloaded', 'QR Code saved to device gallery.');
              }}
            >
              <Ionicons name="download-outline" size={20} color={themeTextColor} style={styles.menuIcon} />
              <Text style={[styles.menuText, { color: themeTextColor }]}>Download QR code</Text>
            </TouchableOpacity>

            {/* Option 3: Share QR code */}
            <TouchableOpacity 
              style={styles.menuItem} 
              onPress={() => {
                setShowMenu(false);
                handleShare();
              }}
            >
              <Ionicons name="share-social-outline" size={20} color={themeTextColor} style={styles.menuIcon} />
              <Text style={[styles.menuText, { color: themeTextColor }]}>Share QR code</Text>
            </TouchableOpacity>

            {/* Option 4: Reset to default QR (if custom uploaded) */}
            {qrImageUri && (
              <TouchableOpacity 
                style={styles.menuItem} 
                onPress={async () => {
                  setShowMenu(false);
                  setQrImageUri(null);
                  await AsyncStorage.removeItem('user_qr_code');
                  Alert.alert('Reset Complete', 'Reverted back to default generated QR code.');
                }}
              >
                <Ionicons name="refresh-outline" size={20} color="#ea4335" style={styles.menuIcon} />
                <Text style={[styles.menuText, { color: '#ea4335' }]}>Reset to default QR</Text>
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* GOOGLE PAY BOTTOM SHARE SHEET MODAL */}
      <Modal
        visible={showShareSheet}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowShareSheet(false)}
      >
        <TouchableOpacity 
          style={styles.shareOverlay}
          activeOpacity={1}
          onPress={() => setShowShareSheet(false)}
        >
          <TouchableOpacity 
            style={[styles.shareSheetContainer, { backgroundColor: isDark ? '#202124' : '#ffffff' }]}
            activeOpacity={1}
          >
            {/* DRAG HANDLE BAR */}
            <View style={styles.dragHandle} />

            {/* TITLE ROW */}
            <View style={styles.shareHeaderRow}>
              <Text style={[styles.shareTitle, { color: themeTextColor }]}>Share QR code</Text>
              <TouchableOpacity onPress={() => setShowShareSheet(false)}>
                <Ionicons name="close" size={24} color={themeTextColor} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.shareSubTitle, { color: themeSubTextColor }]}>
              Send your UPI payment QR code to your contacts or other apps
            </Text>

            {/* PREVIEW MINI CARD */}
            <View style={[styles.sharePreviewCard, { backgroundColor: isDark ? '#303134' : '#f0f4f9' }]}>
              <View style={[styles.miniAvatar, { backgroundColor: '#2e7d32' }]}>
                <Text style={styles.miniAvatarText}>{firstLetter}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.miniName, { color: themeTextColor }]}>{userName}</Text>
                <Text style={[styles.miniUpi, { color: themeSubTextColor }]}>{upiId}</Text>
              </View>
              <Ionicons name="qr-code-outline" size={28} color="#0b57d0" />
            </View>

            {/* APP SHARE ICONS ROW */}
            <Text style={[styles.appsSectionTitle, { color: themeSubTextColor }]}>SHARE VIA</Text>
            
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.appsScrollView}>
              {/* 1. WhatsApp */}
              <TouchableOpacity 
                style={styles.appShareItem}
                onPress={() => {
                  setShowShareSheet(false);
                  Share.share({ message: `Pay ${userName} via Google Pay / UPI. UPI ID: ${upiId}` });
                }}
              >
                <View style={[styles.appIconCircle, { backgroundColor: '#25D366' }]}>
                  <Ionicons name="logo-whatsapp" size={26} color="#ffffff" />
                </View>
                <Text style={[styles.appLabel, { color: themeTextColor }]}>WhatsApp</Text>
              </TouchableOpacity>

              {/* 2. WhatsApp Business */}
              <TouchableOpacity 
                style={styles.appShareItem}
                onPress={() => {
                  setShowShareSheet(false);
                  Share.share({ message: `Pay ${userName} via Google Pay / UPI. UPI ID: ${upiId}` });
                }}
              >
                <View style={[styles.appIconCircle, { backgroundColor: '#128C7E' }]}>
                  <MaterialCommunityIcons name="whatsapp" size={26} color="#ffffff" />
                </View>
                <Text style={[styles.appLabel, { color: themeTextColor }]}>WA Business</Text>
              </TouchableOpacity>

              {/* 3. Instagram */}
              <TouchableOpacity 
                style={styles.appShareItem}
                onPress={() => {
                  setShowShareSheet(false);
                  Share.share({ message: `Pay ${userName} via Google Pay / UPI. UPI ID: ${upiId}` });
                }}
              >
                <View style={[styles.appIconCircle, { backgroundColor: '#C13584' }]}>
                  <Ionicons name="logo-instagram" size={26} color="#ffffff" />
                </View>
                <Text style={[styles.appLabel, { color: themeTextColor }]}>Instagram</Text>
              </TouchableOpacity>

              {/* 4. Messages / SMS */}
              <TouchableOpacity 
                style={styles.appShareItem}
                onPress={() => {
                  setShowShareSheet(false);
                  Share.share({ message: `Pay ${userName} via Google Pay / UPI. UPI ID: ${upiId}` });
                }}
              >
                <View style={[styles.appIconCircle, { backgroundColor: '#1a73e8' }]}>
                  <Ionicons name="chatbox" size={24} color="#ffffff" />
                </View>
                <Text style={[styles.appLabel, { color: themeTextColor }]}>Messages</Text>
              </TouchableOpacity>

              {/* 5. Gmail */}
              <TouchableOpacity 
                style={styles.appShareItem}
                onPress={() => {
                  setShowShareSheet(false);
                  Share.share({ message: `Pay ${userName} via Google Pay / UPI. UPI ID: ${upiId}` });
                }}
              >
                <View style={[styles.appIconCircle, { backgroundColor: '#ea4335' }]}>
                  <Ionicons name="mail" size={24} color="#ffffff" />
                </View>
                <Text style={[styles.appLabel, { color: themeTextColor }]}>Gmail</Text>
              </TouchableOpacity>

              {/* 6. Telegram */}
              <TouchableOpacity 
                style={styles.appShareItem}
                onPress={() => {
                  setShowShareSheet(false);
                  Share.share({ message: `Pay ${userName} via Google Pay / UPI. UPI ID: ${upiId}` });
                }}
              >
                <View style={[styles.appIconCircle, { backgroundColor: '#0088cc' }]}>
                  <Ionicons name="paper-plane" size={24} color="#ffffff" />
                </View>
                <Text style={[styles.appLabel, { color: themeTextColor }]}>Telegram</Text>
              </TouchableOpacity>

              {/* 7. Copy Link */}
              <TouchableOpacity 
                style={styles.appShareItem}
                onPress={() => {
                  setShowShareSheet(false);
                  Alert.alert('Copied!', `Payment link and UPI ID (${upiId}) copied to clipboard.`);
                }}
              >
                <View style={[styles.appIconCircle, { backgroundColor: '#5f6368' }]}>
                  <Ionicons name="copy" size={24} color="#ffffff" />
                </View>
                <Text style={[styles.appLabel, { color: themeTextColor }]}>Copy Link</Text>
              </TouchableOpacity>

              {/* 8. More Apps */}
              <TouchableOpacity 
                style={styles.appShareItem}
                onPress={() => {
                  setShowShareSheet(false);
                  Share.share({ message: `Pay ${userName} via Google Pay / UPI. UPI ID: ${upiId}` });
                }}
              >
                <View style={[styles.appIconCircle, { backgroundColor: '#202124' }]}>
                  <Ionicons name="share-social" size={24} color="#ffffff" />
                </View>
                <Text style={[styles.appLabel, { color: themeTextColor }]}>More Apps</Text>
              </TouchableOpacity>
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* LIGHT BLUE QR CONTAINER CARD */}
        <View style={[styles.qrCardContainer, { backgroundColor: themeCardBg }]}>
          {/* USER NAME & AVATAR ROW */}
          <View style={styles.userHeaderRow}>
            <View style={[styles.avatarCircle, { backgroundColor: '#2e7d32' }]}>
              <Text style={styles.avatarLetter}>{firstLetter}</Text>
            </View>
            <Text style={[styles.userNameText, { color: themeTextColor }]}>{userName}</Text>
          </View>

          {/* CLEAN DYNAMIC QR CODE DISPLAY BOX */}
          <View style={styles.qrCodeWrapper}>
            {uploading ? (
              <ActivityIndicator size="large" color="#0b57d0" />
            ) : qrImageUri ? (
              <Image 
                source={{ uri: qrImageUri }} 
                style={styles.qrImage} 
                resizeMode="contain" 
              />
            ) : (
              <Image 
                source={require('@/assets/images/qr_code_icon.png')} 
                style={styles.qrImage} 
                resizeMode="contain" 
              />
            )}
          </View>

          <Text style={[styles.scanSubText, { color: themeSubTextColor }]}>Scan to pay with any UPI app</Text>

          {/* BANK ACCOUNT PILL BUTTON */}
          <TouchableOpacity 
            style={[styles.bankPillButton, { backgroundColor: '#ffffff' }]}
            onPress={() => router.push('/add-bank')}
          >
            <View style={styles.bankLogoCircle}>
              <MaterialCommunityIcons name="bank" size={18} color="#0b57d0" />
            </View>
            <Text style={styles.bankPillText}>{bankName}</Text>
            <Ionicons name="chevron-forward" size={16} color="#5f6368" />
          </TouchableOpacity>

          {/* UPI ID ROW WITH COPY BUTTON */}
          <TouchableOpacity style={styles.upiIdRow} onPress={handleCopyUpi}>
            <Text style={[styles.upiIdLabel, { color: themeTextColor }]}>UPI ID: {upiId}</Text>
            <Ionicons name="copy-outline" size={18} color="#0b57d0" style={{ marginLeft: 6 }} />
          </TouchableOpacity>
        </View>

        {/* SWITCH QR LINK BELOW CARD */}
        <View style={styles.switchQrRow}>
          <Text style={[styles.switchQrText, { color: themeSubTextColor }]}>Want to join UPI Circle? </Text>
          <TouchableOpacity onPress={() => Alert.alert('UPI Circle', 'Switch QR Code')}>
            <Text style={styles.switchQrLink}>Switch QR</Text>
          </TouchableOpacity>
        </View>

        {/* BOTTOM ACTION BUTTONS */}
        <View style={styles.bottomButtonsSection}>
          {/* Share QR Code Button */}
          <TouchableOpacity 
            style={styles.shareBtn}
            onPress={handleShare}
          >
            <Ionicons name="share-social-outline" size={20} color="#ffffff" style={{ marginRight: 8 }} />
            <Text style={styles.shareBtnText}>Share QR code</Text>
          </TouchableOpacity>

          {/* Open Scanner Button */}
          <TouchableOpacity 
            style={[styles.scannerBtn, { borderColor: themeTextColor }]}
            onPress={() => router.push('/scan-qr')}
          >
            <MaterialIcons name="qr-code-scanner" size={20} color="#0b57d0" style={{ marginRight: 8 }} />
            <Text style={styles.scannerBtnText}>Open scanner</Text>
          </TouchableOpacity>
        </View>

        {/* POWERED BY UPI FOOTER */}
        <View style={styles.footerSection}>
          <Text style={styles.poweredByText}>POWERED BY</Text>
          <UpiFooterLogo />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  topNavRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  navIconButton: {
    padding: 8,
  },
  topRightNav: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 40,
    alignItems: 'center',
  },
  qrCardContainer: {
    width: '100%',
    borderRadius: 24,
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  userHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarLetter: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  userNameText: {
    fontSize: 22,
    fontWeight: '800',
  },
  qrCodeWrapper: {
    width: 250,
    height: 250,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  qrImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  scanSubText: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 20,
  },
  bankPillButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e8f0fe',
    marginBottom: 16,
  },
  bankLogoCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#e8f0fe',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  bankPillText: {
    color: '#202124',
    fontSize: 14,
    fontWeight: '700',
    marginRight: 8,
  },
  upiIdRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  upiIdLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  switchQrRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  switchQrText: {
    fontSize: 14,
    fontWeight: '500',
  },
  switchQrLink: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0b57d0',
    textDecorationLine: 'underline',
  },
  bottomButtonsSection: {
    width: '100%',
    marginBottom: 24,
  },
  shareBtn: {
    backgroundColor: '#0b57d0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 24,
    marginBottom: 12,
  },
  shareBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
  scannerBtn: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#0b57d0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 24,
  },
  scannerBtnText: {
    color: '#0b57d0',
    fontSize: 15,
    fontWeight: '800',
  },
  footerSection: {
    alignItems: 'center',
  },
  poweredByText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#70706e',
    marginBottom: 2,
    letterSpacing: 0.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: Platform.OS === 'ios' ? 54 : 40,
    paddingRight: 16,
  },
  menuContainer: {
    width: 210,
    borderRadius: 16,
    paddingVertical: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.18,
        shadowRadius: 10,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  menuIcon: {
    marginRight: 14,
  },
  menuText: {
    fontSize: 14,
    fontWeight: '600',
  },

  // GOOGLE PAY BOTTOM SHARE SHEET STYLES
  shareOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  shareSheetContainer: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    paddingHorizontal: 20,
  },
  dragHandle: {
    width: 36,
    height: 4,
    backgroundColor: '#dadce0',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  shareHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  shareTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  shareSubTitle: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 18,
  },
  sharePreviewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    marginBottom: 20,
  },
  miniAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  miniAvatarText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  miniName: {
    fontSize: 15,
    fontWeight: '700',
  },
  miniUpi: {
    fontSize: 12,
    fontWeight: '500',
  },
  appsSectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 14,
  },
  appsScrollView: {
    flexDirection: 'row',
    paddingBottom: 8,
  },
  appShareItem: {
    alignItems: 'center',
    marginRight: 20,
    width: 64,
  },
  appIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  appLabel: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
});
