import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  TextInput,
  Animated,
  Platform,
  useColorScheme,
  StatusBar,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { Ionicons, FontAwesome6 } from '@expo/vector-icons';
import Constants from 'expo-constants';

export interface BankItem {
  id: string;
  name: string;
  shortName: string;
  color: string;
  icon: string;
  domain?: string;
  useLocalAsset?: boolean;
  localAssetSource?: any;
}

export const BANKS_LIST: BankItem[] = [
  { id: '1', name: 'HDFC Bank', shortName: 'HDFC', color: '#003366', icon: 'wallet-outline', domain: 'hdfcbank.com' },
  { id: '2', name: 'ICICI Bank', shortName: 'ICICI', color: '#FF6600', icon: 'card-outline', useLocalAsset: true, localAssetSource: require('@/assets/images/icici_bank_logo.png') },
  { id: '3', name: 'State Bank of India', shortName: 'SBI', color: '#00BFFF', icon: 'business-outline', domain: 'sbi.co.in' },
  { id: '4', name: 'Axis Bank', shortName: 'Axis', color: '#800020', icon: 'trending-up-outline', useLocalAsset: true, localAssetSource: require('@/assets/images/axis_bank_logo.png') },
  { id: '5', name: 'Punjab National Bank', shortName: 'PNB', color: '#A30000', icon: 'grid-outline', domain: 'pnbindia.in' },
  { id: '6', name: 'Bank of Baroda', shortName: 'BOB', color: '#FF530D', icon: 'shield-checkmark-outline', domain: 'bankofbaroda.in' },
  { id: '7', name: 'Kotak Mahindra Bank', shortName: 'KOTAK', color: '#ed1c24', icon: 'wallet-outline', domain: 'kotak.com' },
  { id: '8', name: 'IndusInd Bank', shortName: 'INDUS', color: '#85191c', icon: 'card-outline', domain: 'indusind.com' },
  { id: '9', name: 'Yes Bank', shortName: 'YES', color: '#0d47a1', icon: 'business-outline', domain: 'yesbank.in' },
  { id: '10', name: 'Federal Bank', shortName: 'FED', color: '#003399', icon: 'trending-up-outline', domain: 'federalbank.co.in' },
  { id: '11', name: 'Union Bank of India', shortName: 'UBI', color: '#ff0000', icon: 'grid-outline', domain: 'unionbankofindia.co.in' },
  { id: '12', name: 'Canara Bank', shortName: 'CANARA', color: '#005f9e', icon: 'shield-checkmark-outline', domain: 'canarabank.com' },
  { id: '13', name: 'IDFC First Bank', shortName: 'IDFC', color: '#922724', icon: 'wallet-outline', domain: 'idfcfirstbank.com' },
  { id: '14', name: 'Indian Bank', shortName: 'INDIAN', color: '#1a73e8', icon: 'card-outline', domain: 'indianbank.in' },
  { id: '15', name: 'Central Bank of India', shortName: 'CBI', color: '#002e77', icon: 'wallet-outline', domain: 'centralbankofindia.co.in' },
  { id: '16', name: 'UCO Bank', shortName: 'UCO', color: '#ffd100', icon: 'card-outline', domain: 'ucobank.com' },
  { id: '17', name: 'Bank of India', shortName: 'BOI', color: '#003a7a', icon: 'business-outline', domain: 'bankofindia.co.in' },
  { id: '18', name: 'Indian Overseas Bank', shortName: 'IOB', color: '#003366', icon: 'trending-up-outline', domain: 'iob.in' },
  { id: '19', name: 'Bank of Maharashtra', shortName: 'BOM', color: '#0b2447', icon: 'grid-outline', domain: 'bankofmaharashtra.in' },
  { id: '20', name: 'Punjab & Sind Bank', shortName: 'PSB', color: '#004b87', icon: 'shield-checkmark-outline', domain: 'punjabandsindbank.co.in' },
  { id: '21', name: 'Karnataka Bank', shortName: 'KTK', color: '#d22630', icon: 'wallet-outline', domain: 'karnatakabank.com' },
  { id: '22', name: 'Karur Vysya Bank', shortName: 'KVB', color: '#005a9c', icon: 'card-outline', domain: 'kvb.co.in' },
  { id: '23', name: 'South Indian Bank', shortName: 'SIB', color: '#013e7f', icon: 'business-outline', domain: 'southindianbank.com' },
  { id: '24', name: 'Standard Chartered Bank', shortName: 'SCB', color: '#007a33', icon: 'trending-up-outline', domain: 'sc.com' },
  { id: '25', name: 'Citibank', shortName: 'CITI', color: '#003b7e', icon: 'grid-outline', domain: 'citibank.co.in' },
  { id: '26', name: 'HSBC Bank', shortName: 'HSBC', color: '#db0011', icon: 'shield-checkmark-outline', domain: 'hsbc.co.in' },
  { id: '27', name: 'RBL Bank', shortName: 'RBL', color: '#005ca9', icon: 'wallet-outline', domain: 'rblbank.com' },
  { id: '28', name: 'Bandhan Bank', shortName: 'BANDHAN', color: '#003366', icon: 'card-outline', domain: 'bandhanbank.com' },
  { id: '29', name: 'DBS Bank', shortName: 'DBS', color: '#ff0000', icon: 'business-outline', domain: 'dbs.com' },
  { id: '30', name: 'Jammu & Kashmir Bank', shortName: 'JKB', color: '#003399', icon: 'trending-up-outline', domain: 'jkbank.com' },
  { id: '31', name: 'Tamilnad Mercantile Bank', shortName: 'TMB', color: '#0d47a1', icon: 'grid-outline', domain: 'tmb.in' },
];

export default function AddBankAccountScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const router = useRouter();

  const themeBgColor = isDark ? '#121212' : '#ffffff';
  const themeCardBg = isDark ? '#202124' : '#f1f3f4';
  const themeTextColor = isDark ? '#ffffff' : '#202124';
  const themeSubTextColor = isDark ? '#9aa0a6' : '#5f6368';
  const themeBorderColor = isDark ? '#3c4043' : '#dadce0';

  const [searchQuery, setSearchQuery] = useState('');
  const [phone, setPhone] = useState('');
  const [userName, setUserName] = useState('');
  
  // Selection states
  const [selectedBank, setSelectedBank] = useState<BankItem | null>(null);
  const [step, setStep] = useState<'select' | 'loading' | 'success'>('select');
  const [timerCount, setTimerCount] = useState(10);
  const [generatedUpi, setGeneratedUpi] = useState('');
  const [saving, setSaving] = useState(false);

  // Animations
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  // Resolve backend server local IP
  const hostUri = Constants.expoConfig?.hostUri;
  const localIp = hostUri ? hostUri.split(':')[0] : 'localhost';
  const API_HOST = `http://${localIp}:5000`;

  useEffect(() => {
    async function loadUserInfo() {
      const storedPhone = await AsyncStorage.getItem('user_phone') || '';
      const storedName = await AsyncStorage.getItem('user_name') || '';
      setPhone(storedPhone);
      setUserName(storedName);
    }
    loadUserInfo();
  }, []);

  // 10 Second Fake Search Loader
  useEffect(() => {
    let interval: any;
    if (step === 'loading' && selectedBank) {
      // Trigger animations
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.2, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1.0, duration: 800, useNativeDriver: true }),
        ])
      ).start();

      Animated.timing(progressAnim, {
        toValue: 1,
        duration: 10000,
        useNativeDriver: false,
      }).start();

      setTimerCount(10);
      interval = setInterval(() => {
        setTimerCount(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            handleLoaderFinished();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, selectedBank]);

  const handleBankSelect = (bank: BankItem) => {
    setSelectedBank(bank);
    setStep('loading');
  };

  const handleLoaderFinished = () => {
    if (!selectedBank) return;
    const suffixMap: { [key: string]: string } = {
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
      'Tamilnad Mercantile Bank': 'oktmb',
    };
    const suffix = suffixMap[selectedBank.name] || 'okaxis';
    const prefix = userName.toLowerCase().replace(/[^a-z0-9]/g, '') || phone.replace(/[^0-9]/g, '');
    setGeneratedUpi(`${prefix}@${suffix}`);
    setStep('success');
  };

  const handleSaveAccount = async () => {
    if (!selectedBank) return;
    setSaving(true);
    try {
      // Mock account number ends with 4 random digits
      const randomAcc = `•••• ${Math.floor(1000 + Math.random() * 9000)}`;
      
      const response = await fetch(`${API_HOST}/api/add-bank`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone,
          bankName: selectedBank.name,
          accountNumber: randomAcc,
        }),
      });

      const data = await response.json();
      if (data.success) {
        // Save the dynamic active UPI ID in AsyncStorage
        await AsyncStorage.setItem('active_upi_id', data.bankAccount.upiId);
        // Save all bank accounts list locally for quick display
        await AsyncStorage.setItem('bank_accounts', JSON.stringify(data.bankAccounts));
        
        router.replace('/(tabs)');
      } else {
        alert(data.message || 'Failed to link bank account.');
      }
    } catch (error) {
      console.error('Error linking account:', error);
      alert('Network error while linking bank account.');
    } finally {
      setSaving(false);
    }
  };

  const filteredBanks = BANKS_LIST.filter(bank =>
    bank.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeBgColor }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* STEP 1: Select bank */}
      {step === 'select' && (
        <View style={styles.content}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={themeTextColor} />
            </TouchableOpacity>
            <Text style={[styles.title, { color: themeTextColor }]}>Select your bank</Text>
          </View>

          <View style={[styles.searchBar, { backgroundColor: themeCardBg }]}>
            <Ionicons name="search" size={20} color={themeSubTextColor} style={styles.searchIcon} />
            <TextInput
              style={[styles.searchInput, { color: themeTextColor }]}
              placeholder="Search bank name"
              placeholderTextColor={themeSubTextColor}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <FlatList
            data={filteredBanks}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => handleBankSelect(item)}
                style={[styles.bankItem, { borderBottomColor: themeBorderColor }]}
              >
                <View style={[styles.bankIconCircle, { backgroundColor: item.useLocalAsset ? '#ffffff' : item.color, overflow: 'hidden' }]}>
                  {item.useLocalAsset ? (
                    <Image source={item.localAssetSource} style={{ width: '100%', height: '100%' }} resizeMode="contain" />
                  ) : item.domain ? (
                    <Image 
                      source={{ uri: `https://img.logo.dev/${item.domain}?token=pk_K5tbWMjaQYadU9Se2KkiXQ` }} 
                      style={{ width: '100%', height: '100%', backgroundColor: '#ffffff' }} 
                      resizeMode="contain" 
                    />
                  ) : (
                    <Ionicons name={item.icon as any} size={20} color="#ffffff" />
                  )}
                </View>
                <Text style={[styles.bankName, { color: themeTextColor }]}>{item.name}</Text>
                <Ionicons name="chevron-forward" size={18} color={themeSubTextColor} />
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {/* STEP 2: Loading/Searching 10s delay */}
      {step === 'loading' && selectedBank && (
        <View style={styles.loadingContainer}>
          <Animated.View style={[styles.pulseCircle, { transform: [{ scale: pulseAnim }], backgroundColor: selectedBank.color + '1a' }]}>
            <View style={[styles.bankLogoLarge, { backgroundColor: selectedBank.useLocalAsset ? '#ffffff' : selectedBank.color, overflow: 'hidden' }]}>
              {selectedBank.useLocalAsset ? (
                <Image source={selectedBank.localAssetSource} style={{ width: '100%', height: '100%' }} resizeMode="contain" />
              ) : selectedBank.domain ? (
                <Image 
                  source={{ uri: `https://img.logo.dev/${selectedBank.domain}?token=pk_K5tbWMjaQYadU9Se2KkiXQ` }} 
                  style={{ width: '100%', height: '100%', backgroundColor: '#ffffff' }} 
                  resizeMode="contain" 
                />
              ) : (
                <Ionicons name={selectedBank.icon as any} size={40} color="#ffffff" />
              )}
            </View>
          </Animated.View>

          <Text style={[styles.loadingTitle, { color: themeTextColor }]}>
            Finding your bank account
          </Text>
          <Text style={[styles.loadingDesc, { color: themeSubTextColor }]}>
            Contacting {selectedBank.name} to retrieve accounts linked with your registered phone number {phone}...
          </Text>

          {/* Progress bar */}
          <View style={styles.progressBarBg}>
            <Animated.View
              style={[
                styles.progressBarFill,
                {
                  backgroundColor: '#1a73e8',
                  width: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                },
              ]}
            />
          </View>

          <Text style={[styles.timerText, { color: themeSubTextColor }]}>
            Time remaining: {timerCount} seconds
          </Text>
          <ActivityIndicator size="small" color="#1a73e8" style={styles.loadingSpinner} />
        </View>
      )}

      {/* STEP 3: Success Screen */}
      {step === 'success' && selectedBank && (
        <View style={styles.successContainer}>
          <View style={styles.successIconCircle}>
            <Ionicons name="checkmark-circle" size={80} color="#34a853" />
          </View>

          <Text style={[styles.successTitle, { color: themeTextColor }]}>Account Found!</Text>
          <Text style={[styles.successDesc, { color: themeSubTextColor }]}>
            We found a {selectedBank.name} savings account linked to {phone}.
          </Text>

          <View style={[styles.accountCard, { backgroundColor: themeCardBg, borderColor: themeBorderColor }]}>
            <View style={styles.cardHeaderRow}>
              <View style={[styles.miniBankLogo, { backgroundColor: selectedBank.useLocalAsset ? '#ffffff' : selectedBank.color, overflow: 'hidden' }]}>
                {selectedBank.useLocalAsset ? (
                  <Image source={selectedBank.localAssetSource} style={{ width: '100%', height: '100%' }} resizeMode="contain" />
                ) : selectedBank.domain ? (
                  <Image 
                    source={{ uri: `https://img.logo.dev/${selectedBank.domain}?token=pk_K5tbWMjaQYadU9Se2KkiXQ` }} 
                    style={{ width: '100%', height: '100%', backgroundColor: '#ffffff' }} 
                    resizeMode="contain" 
                  />
                ) : (
                  <Ionicons name={selectedBank.icon as any} size={14} color="#ffffff" />
                )}
              </View>
              <Text style={[styles.cardBankTitle, { color: themeTextColor }]}>{selectedBank.name}</Text>
            </View>
            <Text style={[styles.cardAccNumber, { color: themeTextColor }]}>Savings Account •••• 9876</Text>
            
            <View style={styles.upiPillRow}>
              <Text style={[styles.upiLabelText, { color: themeSubTextColor }]}>Generated UPI ID:</Text>
              <Text style={[styles.upiValueText, { color: '#1a73e8' }]}>{generatedUpi}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSaveAccount}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <>
                <Text style={styles.saveButtonText}>Add & Link Account</Text>
                <Ionicons name="arrow-forward" size={16} color="#ffffff" style={styles.saveButtonIcon} />
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 24,
    height: 48,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  bankItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 0.5,
  },
  bankIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  bankName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  pulseCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  bankLogoLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  loadingTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  loadingDesc: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
  },
  progressBarBg: {
    width: '100%',
    height: 6,
    backgroundColor: '#dadce0',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBarFill: {
    height: '100%',
  },
  timerText: {
    fontSize: 13,
    marginBottom: 20,
  },
  loadingSpinner: {
    marginTop: 10,
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  successIconCircle: {
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  successDesc: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 20,
  },
  accountCard: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 16,
    padding: 20,
    marginBottom: 40,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  miniBankLogo: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  cardBankTitle: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  cardAccNumber: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  upiPillRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 0.5,
    borderTopColor: '#dadce0',
  },
  upiLabelText: {
    fontSize: 12,
    fontWeight: '600',
  },
  upiValueText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: '#1a73e8',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 24,
    width: '100%',
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  saveButtonIcon: {
    marginLeft: 8,
  },
});
