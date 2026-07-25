import { getApiBaseUrl } from '@/constants/config';
import React, { useState, useCallback, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  StatusBar,
  Platform,
  Image,
  Dimensions,
  Modal,
} from 'react-native';
import LottieView from 'lottie-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, FontAwesome6 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import Constants from 'expo-constants';
import { BANKS_LIST } from '../add-bank';
import { fullPeopleList, fullBusinessesList } from './index';

interface BankAccount {
  bankName: string;
  accountNumber: string;
  upiId: string;
  isDefault: boolean;
  monthlyLimit?: number;
  monthlySpent?: number;
  carryOverBalance?: number;
}

interface Transaction {
  id: string;
  recipientName: string;
  recipientUpiId: string;
  amount: number;
  type: string;
  fromBankName: string;
  toBankName?: string;
  note?: string;
  date: string;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const HERO_IMAGE_HEIGHT = SCREEN_HEIGHT * 0.35;

export default function MoneyScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const router = useRouter();

  const themeBgColor = isDark ? '#121212' : '#ffffff';
  const themeCardBg = 'transparent';
  const themeTextColor = isDark ? '#ffffff' : '#202124';
  const themeSubTextColor = isDark ? '#9aa0a6' : '#5f6368';
  const themeBorderColor = isDark ? '#3c4043' : '#dadce0';

  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [lottieLoading, setLottieLoading] = useState(false);
  const [pendingAccount, setPendingAccount] = useState<{ key: string; account: BankAccount } | null>(null);
  const lottieRef = useRef<LottieView>(null);

  // Format Date for Transaction List
  const formatDateStr = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      
      const isToday = date.getDate() === now.getDate() &&
                      date.getMonth() === now.getMonth() &&
                      date.getFullYear() === now.getFullYear();

      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      const isYesterday = date.getDate() === yesterday.getDate() &&
                          date.getMonth() === yesterday.getMonth() &&
                          date.getFullYear() === yesterday.getFullYear();

      let hours = date.getHours();
      const minutes = date.getMinutes().toString().padStart(2, '0');
      const ampm = hours >= 12 ? 'pm' : 'am';
      hours = hours % 12;
      hours = hours ? hours : 12;
      const timeStr = `${hours}:${minutes} ${ampm}`;

      if (isToday) {
        return `Today, ${timeStr}`;
      } else if (isYesterday) {
        return `Yesterday, ${timeStr}`;
      } else {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}, ${timeStr}`;
      }
    } catch (e) {
      return dateStr;
    }
  };

  // Load bank details and transaction history on screen focus
  useFocusEffect(
    useCallback(() => {
      async function loadBankDetails() {
        try {
          const phone = await AsyncStorage.getItem('user_phone') || '';
          const storedBanks = await AsyncStorage.getItem('bank_accounts');
          if (storedBanks) {
            setBankAccounts(JSON.parse(storedBanks));
          }
          if (phone) {
            const apiHost = getApiBaseUrl();
            const res = await fetch(`${apiHost}/api/get-bank-accounts?phone=${phone}`);
            const data = await res.json();
            if (data.success && data.bankAccounts) {
              setBankAccounts(data.bankAccounts);
              await AsyncStorage.setItem('bank_accounts', JSON.stringify(data.bankAccounts));
            }
          }
        } catch (error) {
          console.error('Failed to load bank accounts:', error);
        }
      }

      async function loadTransactionHistory() {
        try {
          const storedTx = await AsyncStorage.getItem('transaction_history');
          if (storedTx) {
            setTransactions(JSON.parse(storedTx));
          } else {
            // Mock initial transaction history
            const initialMocks = [
              {
                id: 'mock-1',
                recipientName: 'Self: HDFC Bank',
                recipientUpiId: 'self@hdfc',
                amount: 10.00,
                type: 'self_transfer',
                fromBankName: 'State Bank of India',
                toBankName: 'HDFC Bank',
                date: new Date(Date.now() - 3600000 * 2).toISOString(), // 2 hours ago
              },
              {
                id: 'mock-2',
                recipientName: 'Jio Prepaid',
                recipientUpiId: 'jio@paytm',
                amount: 719.00,
                type: 'person',
                fromBankName: 'HDFC Bank',
                date: new Date(Date.now() - 3600000 * 24).toISOString(), // 1 day ago
              },
              {
                id: 'mock-3',
                recipientName: 'Ramesh Kumar',
                recipientUpiId: 'ramesh@oksbi',
                amount: 500.00,
                type: 'person',
                fromBankName: 'ICICI Bank',
                date: new Date(Date.now() - 3600000 * 48).toISOString(), // 2 days ago
              }
            ];
            setTransactions(initialMocks);
            await AsyncStorage.setItem('transaction_history', JSON.stringify(initialMocks));
          }
        } catch (error) {
          console.error('Failed to load transactions:', error);
        }
      }

      loadBankDetails();
      loadTransactionHistory();
    }, [])
  );

  // Handle check balance: show lottie animation first, then navigate
  const handleCheckBalance = (accountKey: string, account: BankAccount) => {
    setPendingAccount({ key: accountKey, account });
    setLottieLoading(true);
    setTimeout(() => {
      setLottieLoading(false);
      setPendingAccount(null);
      router.push({
        pathname: '/check-balance' as any,
        params: {
          bankName: account.bankName,
          accountNumber: account.accountNumber,
          monthlyLimit: String(account.monthlyLimit ?? 10000),
          monthlySpent: String(account.monthlySpent ?? 0),
          carryOverBalance: String(account.carryOverBalance ?? 0),
        },
      });
    }, 2200);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: themeBgColor }]} edges={['bottom', 'left', 'right']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Lottie Loading Overlay */}
      <Modal transparent visible={lottieLoading} animationType="fade">
        <View style={styles.lottieOverlay}>
          <LottieView
            ref={lottieRef}
            source={require('../../assets/videos/Loading state.lottie')}
            style={styles.lottieAnim}
            autoPlay
            loop
            resizeMode="contain"
          />
          <Text style={styles.lottieOverlayText}>Verifying account...</Text>
        </View>
      </Modal>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        {/* 1. HERO IMAGE BANNER (EDGE-TO-EDGE) */}
        <View style={styles.heroContainer}>
          <Image
            source={require('@/assets/images/glad_you_are_here.png')}
            style={styles.heroImage}
            resizeMode="cover"
          />
        </View>

        {/* 2. PADDED WRAPPER FOR ALL DETAILS */}
        <View style={styles.contentPadding}>
          
          {/* TITLE HEADER */}
          <Text style={[styles.moneyTitle, { color: themeTextColor }]}>Money</Text>

          {/* BANK ACCOUNTS SECTION */}
          {bankAccounts.length > 0 ? (
            <View style={styles.accountsWrapper}>
              {bankAccounts.map((account, idx) => {
                const bankDetail = BANKS_LIST.find(b => b.name === account.bankName);
                const accountKey = `${account.bankName}_${account.accountNumber}`;

                return (
                  <View key={idx} style={[styles.bankRow, { borderColor: themeBorderColor, backgroundColor: themeCardBg }]}>
                    <View style={styles.bankLeft}>
                      {/* Bank Logo */}
                      <View style={[styles.bankLogoCircle, { backgroundColor: bankDetail?.useLocalAsset ? '#ffffff' : (bankDetail?.color || '#1a73e8') }]}>
                        {bankDetail?.useLocalAsset ? (
                          <Image source={bankDetail.localAssetSource} style={styles.logoImage} resizeMode="contain" />
                        ) : bankDetail?.domain ? (
                          <Image 
                            source={{ uri: `https://img.logo.dev/${bankDetail.domain}?token=pk_K5tbWMjaQYadU9Se2KkiXQ` }} 
                            style={[styles.logoImage, { backgroundColor: '#ffffff' }]} 
                            resizeMode="contain" 
                          />
                        ) : (
                          <Ionicons name="card" size={20} color="#ffffff" />
                        )}
                      </View>
                      
                      {/* Bank Info */}
                      <View style={styles.bankInfo}>
                        <Text style={[styles.bankNameText, { color: themeTextColor }]} numberOfLines={1}>{account.bankName}</Text>
                        <Text style={[styles.bankAccText, { color: themeSubTextColor }]}>
                          Savings account • ....{account.accountNumber.slice(-4)}
                        </Text>
                      </View>
                    </View>

                    {/* Right side: Check balance → Lottie → navigate */}
                    <View style={styles.bankRight}>
                      <TouchableOpacity
                        onPress={() => handleCheckBalance(accountKey, account)}
                        activeOpacity={0.7}
                        disabled={lottieLoading}
                      >
                        <Text style={styles.checkBalanceLink}>Check balance</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}

              <TouchableOpacity 
                style={[styles.linkBankButton, { borderColor: themeBorderColor }]}
                onPress={() => router.push('/add-bank' as any)}
                activeOpacity={0.7}
              >
                <Ionicons name="add-circle-outline" size={20} color="#1a73e8" style={{ marginRight: 8 }} />
                <Text style={styles.linkBankButtonText}>Link another bank account</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={[styles.emptyAccountsCard, { backgroundColor: '#ffebe8', borderColor: '#f5c2c2' }]}>
              <View style={styles.cardHeader}>
                <Text style={[styles.cardLabel, { color: '#ea4335' }]}>No Bank Account Linked</Text>
                <Ionicons name="alert-circle" size={20} color="#ea4335" />
              </View>
              <Text style={[styles.cardMainText, { color: '#3c4043' }]}>
                Link your bank account to check balances and pay instantly!
              </Text>
              <TouchableOpacity 
                style={[styles.addBankBtn, { backgroundColor: '#ea4335' }]}
                onPress={() => router.push('/add-bank' as any)}
                activeOpacity={0.8}
              >
                <Text style={styles.addBankBtnText}>Add Bank Account</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* CREDIT FOR YOU SECTION */}
          <Text style={[styles.sectionHeader, { color: themeTextColor }]}>Credit for you</Text>
          <View style={styles.creditRow}>
            {/* Personal Loan Card */}
            <TouchableOpacity 
              style={[styles.creditCard, { backgroundColor: isDark ? '#202124' : '#f8fafd', borderColor: 'transparent' }]} 
              onPress={() => alert('Personal Loan pre-approval is being processed!')}
              activeOpacity={0.8}
            >
              <Image source={require('@/assets/images/personal_loan.png')} style={styles.creditIcon} />
              <Text style={[styles.creditTitle, { color: themeTextColor }]}>Personal loan</Text>
              <Text style={styles.creditSub}>Get up to ₹8 Lakhs</Text>
            </TouchableOpacity>

            {/* Gold Loan Card */}
            <TouchableOpacity 
              style={[styles.creditCard, { backgroundColor: isDark ? '#202124' : '#f8fafd', borderColor: 'transparent' }]} 
              onPress={() => alert('Gold Loan pre-approval is being processed!')}
              activeOpacity={0.8}
            >
              <Image source={require('@/assets/images/gold_loan.png')} style={styles.creditIcon} />
              <Text style={[styles.creditTitle, { color: themeTextColor }]}>Gold loan</Text>
              <Text style={styles.creditSub}>Lowest interest rates</Text>
            </TouchableOpacity>
          </View>

          {/* TRANSACTION HISTORY SECTION */}
          <Text style={[styles.sectionHeader, { color: themeTextColor }]}>Transaction history</Text>
          <View style={[styles.historyContainer, { backgroundColor: 'transparent', borderColor: 'transparent' }]}>
            {transactions.length > 0 ? (
              transactions.map((tx, idx) => {
                const displayName = tx.recipientName;
                const cleanName = displayName.replace('Self: ', '');
                const firstLetter = cleanName.charAt(0).toUpperCase() || 'U';
                
                // Color Palette for User Avatars
                const colors = ['#1a73e8', '#e37426', '#0f9d58', '#ab47bc', '#00acc1', '#3f51b5', '#e91e63'];
                const avatarBg = colors[idx % colors.length];

                // Attempt to find a profile image matching this contact
                const firstWord = cleanName.split(' ')[0].toLowerCase();
                const personMatch = fullPeopleList.find(p => 
                  p.name.toLowerCase() === cleanName.toLowerCase() ||
                  p.name.toLowerCase().includes(firstWord)
                );
                const businessMatch = fullBusinessesList.find(b => 
                  b.name.toLowerCase() === cleanName.toLowerCase() ||
                  b.name.toLowerCase().includes(firstWord)
                );

                const renderAvatar = () => {
                  if (personMatch && personMatch.type === 'image' && personMatch.image) {
                    return <Image source={personMatch.image} style={styles.txAvatarImage} />;
                  }
                  if (businessMatch) {
                    if (businessMatch.type === 'image') {
                      if (businessMatch.image) {
                        return <Image source={businessMatch.image} style={styles.txAvatarImage} />;
                      }
                      if (businessMatch.logoUri) {
                        return <Image source={{ uri: businessMatch.logoUri }} style={styles.txAvatarImage} resizeMode="contain" />;
                      }
                      if (businessMatch.domain) {
                        return (
                          <Image 
                            source={{ uri: `https://img.logo.dev/${businessMatch.domain}?token=pk_K5tbWMjaQYadU9Se2KkiXQ` }} 
                            style={[styles.txAvatarImage, { backgroundColor: '#ffffff' }]} 
                            resizeMode="contain" 
                          />
                        );
                      }
                    }
                  }
                  return <Text style={styles.txAvatarText}>{firstLetter}</Text>;
                };

                return (
                  <View 
                    key={tx.id || idx} 
                    style={[
                      styles.txRow, 
                      idx < transactions.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: themeBorderColor }
                    ]}
                  >
                    <View style={styles.txLeft}>
                      <View style={[styles.txAvatar, { backgroundColor: avatarBg, overflow: 'hidden' }]}>
                        {renderAvatar()}
                      </View>
                      <View style={styles.txInfo}>
                        <Text style={[styles.txName, { color: themeTextColor }]} numberOfLines={1}>
                          {displayName}
                        </Text>
                        <Text style={styles.txDate}>{formatDateStr(tx.date)}</Text>
                      </View>
                    </View>
                    <View style={styles.txRight}>
                      <Text style={[styles.txAmount, { color: themeTextColor }]}>
                        -₹{tx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </Text>
                    </View>
                  </View>
                );
              })
            ) : (
              <View style={styles.emptyHistory}>
                <Ionicons name="receipt-outline" size={32} color={themeSubTextColor} style={{ marginBottom: 8 }} />
                <Text style={[styles.emptyHistoryText, { color: themeSubTextColor }]}>No payments made yet</Text>
              </View>
            )}
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
  scrollContainer: {
    paddingBottom: 40,
  },
  heroContainer: {
    width: '100%',
    height: 150,
    overflow: 'hidden',
    backgroundColor: '#ffffffff',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    zIndex:-10,
  },
  contentPadding: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  moneyTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop: 6,

  },
  accountsWrapper: {
    width: '100%',
  },
  bankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  bankLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  bankLogoCircle: {
    width: 50,
    height: 50,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  bankInfo: {
    flex: 1,
  },
  bankNameText: {
    fontSize: 15,
    fontWeight: '700',
  },
  bankAccText: {
    fontSize: 12,
    marginTop: 2,
  },
  bankRight: {
    justifyContent: 'center',
    alignItems: 'flex-end',
    minWidth: 90,
  },
  checkBalanceLink: {
    fontSize: 14,
    color: '#1a73e8',
    fontWeight: 'bold',
  },
  balanceValText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  linkBankButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 16,
    paddingVertical: 14,
    marginTop: 4,
    marginBottom: 12,
  },
  linkBankButtonText: {
    color: '#1a73e8',
    fontSize: 14,
    fontWeight: 'bold',
  },
  emptyAccountsCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    marginBottom: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardLabel: {
    fontSize: 13,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  cardMainText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  addBankBtn: {
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBankBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 14,
  },
  creditRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  creditCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 0,
    borderColor: 'transparent',
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
    shadowColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
  },
  creditIcon: {
    width: 48,
    height: 48,
    marginBottom: 8,
  },
  creditTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 2,
  },
  creditSub: {
    fontSize: 11,
    color: '#80868b',
    textAlign: 'center',
  },
  historyContainer: {
    overflow: 'hidden',
    marginBottom: 20,
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  txLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  txAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  txAvatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 18,
  },
  txAvatarText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  txInfo: {
    flex: 1,
  },
  txName: {
    fontSize: 15,
    fontWeight: '700',
  },
  txDate: {
    fontSize: 12,
    color: '#5f6368',
    marginTop: 2,
  },
  txRight: {
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  txAmount: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  emptyHistory: {
    padding: 24,
    alignItems: 'center',
  },
  emptyHistoryText: {
    fontSize: 13,
  },
  lottieOverlay: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lottieAnim: {
    width: 220,
    height: 220,
  },
  lottieOverlayText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#5f6368',
    marginTop: 12,
    letterSpacing: 0.3,
  },
});
