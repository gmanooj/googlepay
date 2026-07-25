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
  Platform,
  Modal,
} from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome6, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';

import Constants from 'expo-constants';

export default function ProfileScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [userName, setUserName] = useState('G Manooj');
  const [upiId, setUpiId] = useState('gmanooj1@oksbi');
  const [phone, setPhone] = useState('6380866053');

  const [bankAccountsCount, setBankAccountsCount] = useState<number>(0);
  const [showMenu, setShowMenu] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const storedPhone = await AsyncStorage.getItem('user_phone');
      const storedDetails = await AsyncStorage.getItem('user_details');
      if (storedDetails) {
        const parsed = JSON.parse(storedDetails);
        if (parsed.name) setUserName(parsed.name);
        if (parsed.phone) setPhone(parsed.phone);
      } else if (storedPhone) {
        setPhone(storedPhone);
      }

      const storedUpi = await AsyncStorage.getItem('user_upi');
      if (storedUpi) {
        setUpiId(storedUpi);
      }

      // 1. First check local storage DB cache
      const storedAccounts = await AsyncStorage.getItem('bank_accounts');
      if (storedAccounts) {
        const accounts = JSON.parse(storedAccounts);
        if (Array.isArray(accounts)) {
          setBankAccountsCount(accounts.length);
        }
      }

      // 2. Fetch live data from backend MongoDB database server
      const targetPhone = storedPhone || phone;
      if (targetPhone) {
        const apiHost = getApiBaseUrl();
        const res = await fetch(`${apiHost}/api/get-bank-accounts?phone=${targetPhone}`);
        const data = await res.json();
        if (data.success && data.bankAccounts && Array.isArray(data.bankAccounts)) {
          setBankAccountsCount(data.bankAccounts.length);
          await AsyncStorage.setItem('bank_accounts', JSON.stringify(data.bankAccounts));
        }
      }
    } catch (e) {
      console.error('Failed to load dynamic profile data from DB:', e);
    }
  }, [phone]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const firstLetter = userName.charAt(0).toUpperCase();

  const themeBgColor = isDark ? '#121212' : '#ffffff';
  const themeTextColor = isDark ? '#ffffff' : '#202124';
  const themeSubTextColor = isDark ? '#9aa0a6' : '#5f6368';

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: isDark ? '#121212' : '#fbf8ee' }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      
      {/* HEADER NAV BAR */}
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.headerIconButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={themeTextColor} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.headerIconButton} onPress={() => setShowMenu(true)}>
          <Ionicons name="ellipsis-vertical" size={22} color={themeTextColor} />
        </TouchableOpacity>
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
            {/* Option 1: Referral code */}
            <TouchableOpacity 
              style={styles.menuItem} 
              onPress={() => {
                setShowMenu(false);
                alert('Referral Code: GPAY' + Math.floor(1000 + Math.random() * 9000));
              }}
            >
              <Ionicons name="pricetag-outline" size={20} color={themeTextColor} style={styles.menuIcon} />
              <Text style={[styles.menuText, { color: themeTextColor }]}>Referral code</Text>
            </TouchableOpacity>

            {/* Option 2: Get help */}
            <TouchableOpacity 
              style={styles.menuItem} 
              onPress={() => {
                setShowMenu(false);
                alert('GPay Help Center: How can we help you?');
              }}
            >
              <Ionicons name="help-circle-outline" size={20} color={themeTextColor} style={styles.menuIcon} />
              <Text style={[styles.menuText, { color: themeTextColor }]}>Get help</Text>
            </TouchableOpacity>

            {/* Option 3: Send feedback */}
            <TouchableOpacity 
              style={styles.menuItem} 
              onPress={() => {
                setShowMenu(false);
                alert('Feedback submitted. Thank you!');
              }}
            >
              <MaterialIcons name="feedback" size={20} color={themeTextColor} style={styles.menuIcon} />
              <Text style={[styles.menuText, { color: themeTextColor }]}>Send feedback</Text>
            </TouchableOpacity>

            {/* Option 4: Report fraud or issue */}
            <TouchableOpacity 
              style={styles.menuItem} 
              onPress={() => {
                setShowMenu(false);
                alert('Report Fraud: Ticket logged. Our security team will review this shortly.');
              }}
            >
              <Ionicons name="shield-checkmark-outline" size={20} color="#ea4335" style={styles.menuIcon} />
              <Text style={[styles.menuText, { color: '#ea4335' }]}>Report fraud or issue</Text>
            </TouchableOpacity>

            {/* Option 5: Share profile */}
            <TouchableOpacity 
              style={styles.menuItem} 
              onPress={() => {
                setShowMenu(false);
                alert('Share Link: Copied profile link to clipboard.');
              }}
            >
              <Ionicons name="share-social-outline" size={20} color={themeTextColor} style={styles.menuIcon} />
              <Text style={[styles.menuText, { color: themeTextColor }]}>Share profile</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* HERO PROFILE INFO */}
        <View style={styles.profileHeaderContainer}>
          <View style={styles.profileInfoLeft}>
            <Text style={[styles.userNameText, { color: themeTextColor }]}>{userName}</Text>
            <Text style={[styles.upiIdText, { color: themeSubTextColor }]}>UPI ID: {upiId}</Text>
            
            <View style={styles.phoneRow}>
              <Text style={[styles.phoneText, { color: themeTextColor }]}>{phone}</Text>
              <View style={styles.upiBadge}>
                <Ionicons name="checkmark-circle" size={14} color="#0b57d0" />
                <Text style={styles.upiBadgeText}>UPI number</Text>
              </View>
            </View>
          </View>

          {/* GREEN AVATAR WITH QR CODE OVERLAY */}
          <TouchableOpacity 
            style={styles.avatarWrapper}
            onPress={() => router.push('/my-qr')}
          >
            <View style={[styles.avatarCircle, { backgroundColor: '#2e7d32' }]}>
              <Text style={styles.avatarLetter}>{firstLetter}</Text>
            </View>
            <View style={styles.qrBadgeCircle}>
              <MaterialIcons name="qr-code-2" size={18} color="#202124" />
            </View>
          </TouchableOpacity>
        </View>

        {/* TWO PILL CARDS: REWARDS & REFER A FRIEND */}
        <View style={styles.pillsRow}>
          <TouchableOpacity 
            style={[styles.pillCard, { backgroundColor: isDark ? '#422006' : '#fffbeb' }]}
            onPress={() => router.push('/rewards')}
          >
            <View style={styles.pillIconBox}>
              <Ionicons name="trophy-outline" size={20} color="#b45309" />
            </View>
            <View style={styles.pillTextBox}>
              <Text style={[styles.pillVal, { color: isDark ? '#fef08a' : '#78350f' }]}>₹28</Text>
              <Text style={[styles.pillSub, { color: isDark ? '#fde047' : '#92400e' }]}>Rewards earned</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.pillCard, { backgroundColor: isDark ? '#172554' : '#e0f2fe' }]}
            onPress={() => router.push('/referrals')}
          >
            <View style={styles.pillIconBox}>
              <Ionicons name="people-outline" size={20} color="#0369a1" />
            </View>
            <View style={styles.pillTextBox}>
              <Text style={[styles.pillVal, { color: isDark ? '#bae6fd' : '#0369a1' }]}>Get ₹121</Text>
              <Text style={[styles.pillSub, { color: isDark ? '#7dd3fc' : '#0284c7' }]}>Refer a friend</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* MAIN SHEET CONTAINER */}
        <View style={[styles.sheetContainer, { backgroundColor: themeBgColor }]}>
          
          {/* SET UP PAYMENT METHODS CONTAINER */}
          <View style={[styles.setupCard, { backgroundColor: isDark ? '#202124' : '#f8fafd' }]}>
            <TouchableOpacity 
              style={styles.setupCardHeader}
              onPress={() => alert('Manage Payment Methods')}
            >
              <Text style={[styles.setupTitle, { color: themeTextColor }]}>Set up payment methods 1/3</Text>
              <Ionicons name="chevron-forward" size={20} color="#0b57d0" />
            </TouchableOpacity>

            <View style={styles.methodsRow}>
              {/* Method 1: Bank Account */}
              <TouchableOpacity style={styles.methodItem} onPress={() => router.push('/add-bank')}>
                <View style={styles.methodIconCircle}>
                  <MaterialCommunityIcons name="bank" size={26} color="#0b57d0" />
                </View>
                <Text style={[styles.methodName, { color: themeTextColor }]}>Bank account</Text>
                <Text style={[styles.methodSub, { color: themeSubTextColor }]}>
                  {bankAccountsCount > 0 ? `${bankAccountsCount} account${bankAccountsCount > 1 ? 's' : ''}` : 'Add account'}
                </Text>
              </TouchableOpacity>

              {/* Method 2: RuPay Credit Card */}
              <TouchableOpacity style={styles.methodItem} onPress={() => alert('Add RuPay credit card')}>
                <View style={styles.methodIconCircleDashed}>
                  <MaterialIcons name="credit-card" size={26} color="#0b57d0" />
                  <View style={styles.miniPlusBadge}>
                    <Ionicons name="add-circle" size={16} color="#0b57d0" />
                  </View>
                </View>
                <Text style={[styles.methodName, { color: themeTextColor }]}>RuPay credit card</Text>
                <Text style={[styles.methodSub, { color: themeSubTextColor }]}>Pay with UPI</Text>
              </TouchableOpacity>

              {/* Method 3: UPI Lite */}
              <TouchableOpacity style={styles.methodItem} onPress={() => router.push('/upi-lite')}>
                <View style={[styles.methodIconCircleDashed, { backgroundColor: '#e8f0fe' }]}>
                  <Ionicons name="flash-sharp" size={24} color="#0b57d0" />
                  <View style={styles.miniPlusBadge}>
                    <Ionicons name="add-circle" size={16} color="#0b57d0" />
                  </View>
                </View>
                <Text style={[styles.methodName, { color: themeTextColor }]}>UPI Lite</Text>
                <Text style={[styles.methodSub, { color: themeSubTextColor }]}>Pay PIN-free</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* ACTION LIST OPTIONS */}
          <View style={styles.listSection}>
            {/* Pay with credit or debit cards */}
            <TouchableOpacity style={styles.optionRow} onPress={() => alert('Add credit/debit card')}>
              <MaterialIcons name="credit-card" size={24} color="#0b57d0" style={styles.optionIcon} />
              <View style={styles.optionTextColumn}>
                <Text style={[styles.optionTitle, { color: themeTextColor }]}>Pay with credit or debit cards</Text>
                <Text style={[styles.optionSub, { color: themeSubTextColor }]}>Pay bills with your card</Text>
              </View>
              <Text style={styles.addLinkText}>Add</Text>
            </TouchableOpacity>

            {/* Your QR code */}
            <TouchableOpacity style={styles.optionRow} onPress={() => router.push('/my-qr')}>
              <MaterialIcons name="qr-code" size={24} color="#0b57d0" style={styles.optionIcon} />
              <View style={styles.optionTextColumn}>
                <Text style={[styles.optionTitle, { color: themeTextColor }]}>Your QR code</Text>
                <Text style={[styles.optionSub, { color: themeSubTextColor }]}>Use to receive money from any UPI app</Text>
              </View>
            </TouchableOpacity>

            {/* Autopay */}
            <TouchableOpacity style={styles.optionRow} onPress={() => router.push('/autopay')}>
              <MaterialCommunityIcons name="autorenew" size={24} color="#0b57d0" style={styles.optionIcon} />
              <View style={styles.optionTextColumn}>
                <Text style={[styles.optionTitle, { color: themeTextColor }]}>Autopay</Text>
                <Text style={[styles.optionSub, { color: themeSubTextColor }]}>No pending requests</Text>
              </View>
            </TouchableOpacity>

            {/* Set up pocket money */}
            <TouchableOpacity style={styles.optionRow} onPress={() => router.push('/pocket-money')}>
              <Image 
                source={require('@/assets/images/heart_handshake.png')} 
                style={[styles.optionIconImage, { tintColor: '#0b57d0' }]} 
                resizeMode="contain" 
              />
              <View style={styles.optionTextColumn}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={[styles.optionTitle, { color: themeTextColor }]}>Set up pocket money</Text>
                  <View style={styles.newBadge}>
                    <Text style={styles.newBadgeText}>New</Text>
                  </View>
                </View>
                <Text style={[styles.optionSub, { color: themeSubTextColor }]}>Let your loved ones pay using UPI Circle</Text>
              </View>
            </TouchableOpacity>

            {/* Change / Forgot UPI PIN */}
            <TouchableOpacity style={styles.optionRow} onPress={() => router.push('/set-upi-pin')}>
              <MaterialCommunityIcons name="lock-reset" size={24} color="#0b57d0" style={styles.optionIcon} />
              <View style={styles.optionTextColumn}>
                <Text style={[styles.optionTitle, { color: themeTextColor }]}>Change / Reset UPI PIN</Text>
                <Text style={[styles.optionSub, { color: themeSubTextColor }]}>Forgot PIN? Set a new 6-digit UPI PIN</Text>
              </View>
            </TouchableOpacity>

            {/* Manage Google Account */}
            <TouchableOpacity style={styles.optionRow} onPress={() => alert('Google Account Settings')}>
              <MaterialIcons name="account-circle" size={24} color="#0b57d0" style={styles.optionIcon} />
              <View style={styles.optionTextColumn}>
                <Text style={[styles.optionTitle, { color: themeTextColor }]}>Manage Google Account</Text>
              </View>
            </TouchableOpacity>

            {/* Settings */}
            <TouchableOpacity style={styles.optionRow} onPress={() => router.push('/settings')}>
              <Ionicons name="settings-outline" size={24} color="#0b57d0" style={styles.optionIcon} />
              <View style={styles.optionTextColumn}>
                <Text style={[styles.optionTitle, { color: themeTextColor }]}>Settings</Text>
              </View>
            </TouchableOpacity>

            {/* Help & feedback */}
            <TouchableOpacity style={styles.optionRow} onPress={() => alert('Help & Feedback')}>
              <Ionicons name="help-circle-outline" size={24} color="#0b57d0" style={styles.optionIcon} />
              <View style={styles.optionTextColumn}>
                <Text style={[styles.optionTitle, { color: themeTextColor }]}>Help & feedback</Text>
              </View>
            </TouchableOpacity>

          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerIconButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  profileHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 20,
  },
  profileInfoLeft: {
    flex: 1,
    paddingRight: 16,
  },
  userNameText: {
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 4,
  },
  upiIdText: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  phoneText: {
    fontSize: 14,
    fontWeight: '700',
    marginRight: 8,
  },
  upiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dbeafe',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 14,
  },
  upiBadgeText: {
    color: '#0b57d0',
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 4,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarLetter: {
    color: '#ffffff',
    fontSize: 30,
    fontWeight: 'bold',
  },
  qrBadgeCircle: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#dadce0',
  },
  pillsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  pillCard: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  pillIconBox: {
    marginRight: 8,
  },
  pillTextBox: {
    flex: 1,
  },
  pillVal: {
    fontSize: 15,
    fontWeight: '800',
  },
  pillSub: {
    fontSize: 11,
    fontWeight: '600',
  },
  sheetContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    minHeight: 600,
  },
  setupCard: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
  },
  setupCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  setupTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  methodsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  methodItem: {
    width: '31%',
    alignItems: 'center',
  },
  methodIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e8f0fe',
  },
  methodIconCircleDashed: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#93c5fd',
    borderStyle: 'dashed',
    position: 'relative',
  },
  miniPlusBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#ffffff',
    borderRadius: 8,
  },
  methodName: {
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 2,
  },
  methodSub: {
    fontSize: 10,
    fontWeight: '500',
    textAlign: 'center',
  },
  listSection: {
    paddingTop: 8,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  optionIcon: {
    marginRight: 16,
    width: 24,
  },
  optionIconImage: {
    width: 24,
    height: 24,
    marginRight: 16,
  },
  optionTextColumn: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  optionSub: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  addLinkText: {
    color: '#0b57d0',
    fontSize: 14,
    fontWeight: '800',
  },
  newBadge: {
    backgroundColor: '#0b57d0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },
  newBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '800',
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
});
