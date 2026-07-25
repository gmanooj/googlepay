import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  useColorScheme,
  StatusBar,
  Image,
  Animated,
  Modal,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons, MaterialIcons, FontAwesome5, FontAwesome6, MaterialCommunityIcons } from '@expo/vector-icons';

// Dynamically import expo-contacts to prevent native module load-time crashes in unsupported clients
let Contacts: any = null;
try {
  Contacts = require('expo-contacts');
} catch (e) {
  // Fallback
}


interface PersonItem {
  id: string;
  name: string;
  type?: 'image' | 'icon' | 'letter';
  image?: any;
  icon?: string;
  color?: string;
  isToggle?: boolean;
  letter?: string;
}

interface BusinessItem {
  id: string;
  name: string;
  letter: string;
  color: string;
  isToggle?: boolean;
  icon?: string;
  type?: 'image' | 'letter';
  image?: any;
  domain?: string;
  logoUri?: string;
}

const defaultPeople: PersonItem[] = [
  { id: 'tn_m1', name: 'Karthik Natarajan', type: 'image', image: require('@/assets/images/male1.jpg') },
  { id: 'tn_f1', name: 'Roshini Venugopal', type: 'image', image: require('@/assets/images/female1.jpg') },
  { id: 'tn_m2', name: 'Ashwin Balasubramanian', type: 'letter', letter: 'A', color: '#1a73e8' },
  { id: '4', name: 'Self transfer', type: 'icon', icon: 'swap-horizontal', color: '#ff9800' },
  { id: 'ap_f1', name: 'Harika Kamineni', type: 'image', image: require('@/assets/images/female2.png') },
  { id: 'ap_m1', name: 'Venkat Sai Reddy', type: 'letter', letter: 'V', color: '#a142f4' },
  { id: 'ka_f1', name: 'Rashmika Mandanna', type: 'image', image: require('@/assets/images/female3.png') },
];

export const fullPeopleList: PersonItem[] = [
  { id: 'tn_m1', name: 'Karthik Natarajan', type: 'image', image: require('@/assets/images/male1.jpg') },
  { id: 'tn_f1', name: 'Roshini Venugopal', type: 'image', image: require('@/assets/images/female1.jpg') },
  { id: 'tn_m2', name: 'Ashwin Balasubramanian', type: 'image', image: require('@/assets/images/male2.jpg') },
  { id: '4', name: 'Self transfer', type: 'icon', icon: 'swap-horizontal', color: '#ff9800' },
  { id: 'ap_f1', name: 'Harika Kamineni', type: 'image', image: require('@/assets/images/female2.png') },
  { id: 'ap_m1', name: 'Venkat Sai Reddy', type: 'image', image: require('@/assets/images/male3.png') },
  { id: 'ka_f1', name: 'Rashmika Mandanna', type: 'image', image: require('@/assets/images/female3.png') },
  { id: 'kl_f1', name: 'Anjali Menon', type: 'image', image: require('@/assets/images/female4.png') },
  { id: 'tn_m3', name: 'Siddharth', type: 'letter', letter: 'S', color: '#1a73e8' },
  { id: 'tn_m4', name: 'Kavin', type: 'letter', letter: 'K', color: '#34a853' },
  { id: 'tn_m5', name: 'Arvind', type: 'letter', letter: 'A', color: '#f9ab00' },
  { id: 'tn_m6', name: 'Surya Prakash', type: 'letter', letter: 'S', color: '#ea4335' },
  { id: 'tn_m7', name: 'Vikram', type: 'letter', letter: 'V', color: '#a142f4' },
  { id: 'tn_f2', name: 'Priya', type: 'letter', letter: 'P', color: '#00acc1' },
  { id: 'tn_f3', name: 'Kavya', type: 'letter', letter: 'K', color: '#ff6d00' },
];

const defaultBusinesses: BusinessItem[] = [
  { id: 'b_velavan', name: 'VELAVAN ...', letter: 'V', color: '#37474f' },
  { id: 'b_googleplay', name: 'Google Play', type: 'image', logoUri: 'https://img.icons8.com/color/512/google-play.png', letter: '', color: '#ffffff' },
  { id: 'b_jiohotstar', name: 'JioHotstar', type: 'image', domain: 'hotstar.com', letter: 'J', color: '#002244' },
];

export const fullBusinessesList: BusinessItem[] = [
  { id: 'b_velavan', name: 'VELAVAN ...', letter: 'V', color: '#37474f' },
  { id: 'b_googleplay', name: 'Google Play', type: 'image', logoUri: 'https://img.icons8.com/color/512/google-play.png', letter: '', color: '#ffffff' },
  { id: 'b_jiohotstar', name: 'JioHotstar', type: 'image', domain: 'hotstar.com', letter: 'J', color: '#002244' },
  { id: 'b_dominos', name: 'Dominos Pizza', type: 'image', image: require('@/assets/images/dominos.png'), letter: '', color: '#ffffff' },
  { id: 'b1', name: 'Ramachandran', letter: 'R', color: '#ff5722' },
  { id: 'b2', name: 'Sri Balaji', letter: 'S', color: '#3f51b5' },
  { id: 'b3', name: 'Muthu Coffee', letter: 'M', color: '#795548' },
  { id: 'b4', name: 'Venkateshwara', letter: 'V', color: '#ff9800' },
  { id: 'b5', name: 'Saraswathi Mess', letter: 'S', color: '#e91e63' },
  { id: 'b6', name: 'K.R.S. Tea', letter: 'K', color: '#607d8b' },
  { id: 'b7', name: 'Murugan Idli', letter: 'M', color: '#4caf50' },
  { id: 'b8', name: 'Annapoorna', letter: 'A', color: '#009688' },
  { id: 'b9', name: 'Sai Ram Meals', letter: 'S', color: '#9c27b0' },
  { id: 'b10', name: 'Venu Gopal', letter: 'V', color: '#00bcd4' },
  { id: 'b11', name: 'Srinivasa Store', letter: 'S', color: '#3f51b5' },
];

const sortItemsByLatestTx = (items: any[], history: any[]) => {
  return [...items].sort((a, b) => {
    const txsA = history.filter(tx => 
      (tx.recipientName && tx.recipientName.toLowerCase() === a.name.toLowerCase()) ||
      (tx.recipientUpiId && tx.recipientUpiId.toLowerCase() === a.id.toLowerCase())
    );
    const latestA = txsA.length > 0 ? new Date(txsA[0].date).getTime() : 0;

    const txsB = history.filter(tx => 
      (tx.recipientName && tx.recipientName.toLowerCase() === b.name.toLowerCase()) ||
      (tx.recipientUpiId && tx.recipientUpiId.toLowerCase() === b.id.toLowerCase())
    );
    const latestB = txsB.length > 0 ? new Date(txsB[0].date).getTime() : 0;

    if (latestA !== latestB) {
      return latestB - latestA;
    }

    const indexA = items.findIndex(item => item.id === a.id);
    const indexB = items.findIndex(item => item.id === b.id);
    return indexA - indexB;
  });
};

interface ContactItem {
  id: string;
  name: string;
  phoneNumbers: { number: string; label?: string }[];
  emails?: { email: string; label?: string }[];
}

const MOCK_CONTACTS: ContactItem[] = [
  { id: 'mc1', name: 'Aarav Sharma', phoneNumbers: [{ number: '+91 98765 43210' }] },
  { id: 'mc2', name: 'Aditi Patel', phoneNumbers: [{ number: '+91 87654 32109' }] },
  { id: 'mc3', name: 'Bhavana Rao', phoneNumbers: [{ number: '+91 76543 21098' }] },
  { id: 'mc4', name: 'Chaitanya Reddy', phoneNumbers: [{ number: '+91 65432 10987' }] },
  { id: 'mc5', name: 'Divya Nair', phoneNumbers: [{ number: '+91 91234 56789' }] },
  { id: 'mc6', name: 'Eshwar Iyer', phoneNumbers: [{ number: '+91 92345 67890' }] },
  { id: 'mc7', name: 'Farhan Khan', phoneNumbers: [{ number: '+91 93456 78901' }] },
  { id: 'mc8', name: 'Gauri Sen', phoneNumbers: [{ number: '+91 94567 89012' }] },
  { id: 'mc9', name: 'Hari Krishnan', phoneNumbers: [{ number: '+91 95678 90123' }] },
  { id: 'mc10', name: 'Ishaan Gupta', phoneNumbers: [{ number: '+91 96789 01234' }] },
  { id: 'mc11', name: 'Jannath Nisha', phoneNumbers: [{ number: '+91 97890 12345' }] },
  { id: 'mc12', name: 'Karthik Natarajan', phoneNumbers: [{ number: '+91 98901 23456' }] },
  { id: 'mc13', name: 'Roshini Venugopal', phoneNumbers: [{ number: '+91 99012 34567' }] },
  { id: 'mc14', name: 'Rashmika Mandanna', phoneNumbers: [{ number: '+91 90123 45678' }] },
];

const getAvatarColor = (name: string) => {
  const colors = [
    '#1a73e8', // blue
    '#ea4335', // red
    '#f9ab00', // yellow
    '#34a853', // green
    '#a142f4', // purple
    '#00acc1', // cyan
    '#ff6d00', // orange
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const router = useRouter();

  const [userName, setUserName] = useState('User');
  const [upiId, setUpiId] = useState('gpay@okaxis');
  const [sortedPeople, setSortedPeople] = useState<PersonItem[]>(fullPeopleList);
  const [sortedBusinesses, setSortedBusinesses] = useState<BusinessItem[]>(fullBusinessesList);

  const [phraseIndex, setPhraseIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  const phrases = [
    'Pay anyone on UPI',
    'Pay friends and merchants',
    'Pay by name and phone number'
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -20,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setPhraseIndex(prev => (prev + 1) % phrases.length);
        slideAnim.setValue(20);
        Animated.parallel([
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
        ]).start();
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);
  // Load user details dynamically on screen focus
  const loadUserData = useCallback(async () => {
    try {
      const name = await AsyncStorage.getItem('user_name');
      const phone = await AsyncStorage.getItem('user_phone');
      const activeUpi = await AsyncStorage.getItem('active_upi_id');
      const historyStr = await AsyncStorage.getItem('transaction_history');
      
      if (name) {
        setUserName(name);
      }
      if (activeUpi) {
        setUpiId(activeUpi);
      } else if (phone) {
        const formattedPhone = phone.replace('+', '');
        setUpiId(`${formattedPhone}@okaxis`);
      }

      let history: any[] = [];
      if (historyStr) {
        history = JSON.parse(historyStr);
      }

      const sortedP = sortItemsByLatestTx(fullPeopleList, history);
      const sortedB = sortItemsByLatestTx(fullBusinessesList, history);

      setSortedPeople(sortedP);
      setSortedBusinesses(sortedB);

      const bankAccountsStr = await AsyncStorage.getItem('bank_accounts');
      if (bankAccountsStr) {
        setBankAccountsList(JSON.parse(bankAccountsStr));
      }
    } catch (error) {
      console.error('Failed to load user info:', error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadUserData();
    }, [loadUserData])
  );

  const themeBgColor = isDark ? '#121212' : '#ffffffff';
  const themeCardBg = isDark ? '#202124' : '#ffffff';
  const themeTextColor = isDark ? '#ffffff' : '#202124';
  const themeSubTextColor = isDark ? '#9aa0a6' : '#5f6368';
  const themeBorderColor = isDark ? '#3c4043' : '#dadce0';
  const themeInputBg = isDark ? '#202124' : '#edf2fa';

  const firstLetter = userName.charAt(0).toUpperCase();

  const [showAllPeople, setShowAllPeople] = useState(false);
  const [showAllBusinesses, setShowAllBusinesses] = useState(false);
  const [showCibilModal, setShowCibilModal] = useState(false);
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [bankAccountsList, setBankAccountsList] = useState<any[]>([]);

  // Contacts states
  const [contacts, setContacts] = useState<ContactItem[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<ContactItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showContactsModal, setShowContactsModal] = useState(false);
  const [contactsPermission, setContactsPermission] = useState<'undetermined' | 'granted' | 'denied' | 'loading'>('undetermined');
  const [loadingContacts, setLoadingContacts] = useState(false);

  // Load contacts
  const loadContacts = async () => {
    setLoadingContacts(true);
    try {
      if (Platform.OS === 'web' || !Contacts || !Contacts.getContactsAsync) {
        setContacts(MOCK_CONTACTS);
        setFilteredContacts(MOCK_CONTACTS);
        setContactsPermission('granted');
        return;
      }
      
      const { status } = await Contacts.getPermissionsAsync();
      
      if (status === 'granted') {
        const { data } = await Contacts.getContactsAsync({
          fields: [Contacts.Fields.PhoneNumbers, Contacts.Fields.Emails],
        });
        
        const validContacts = data
          .filter((c: any) => c.name)
          .map((c: any) => ({
            id: c.id || Math.random().toString(),
            name: c.name,
            phoneNumbers: c.phoneNumbers || [],
            emails: c.emails || [],
          }));
          
        if (validContacts.length === 0) {
          setContacts(MOCK_CONTACTS);
          setFilteredContacts(MOCK_CONTACTS);
        } else {
          const sorted = validContacts.sort((a: any, b: any) => a.name.localeCompare(b.name));
          setContacts(sorted);
          setFilteredContacts(sorted);
        }
        setContactsPermission('granted');
      } else {
        setContactsPermission('denied');
      }
    } catch (error) {
      console.error('Failed to load contacts:', error);
      setContacts(MOCK_CONTACTS);
      setFilteredContacts(MOCK_CONTACTS);
      setContactsPermission('granted');
    } finally {
      setLoadingContacts(false);
    }
  };

  const handlePayAnyonePress = async () => {
    if (Platform.OS !== 'web' && Contacts && Contacts.requestPermissionsAsync) {
      try {
        const { status } = await Contacts.requestPermissionsAsync();
        setContactsPermission(status === 'granted' ? 'granted' : 'denied');
      } catch (e) {
        console.error('Permission request error:', e);
      }
    }
    router.push('/pay-anyone' as any);
  };

  const handleRequestPermissionAgain = async () => {
    
    if (!Contacts || !Contacts.requestPermissionsAsync) {
      setContactsPermission('granted');
      setContacts(MOCK_CONTACTS);
      setFilteredContacts(MOCK_CONTACTS);
      return;
    }
    setLoadingContacts(true);
    try {
      const { status } = await Contacts.requestPermissionsAsync();
      setContactsPermission(status === 'granted' ? 'granted' : 'denied');
      if (status === 'granted') {
        await loadContacts();
      }
    } catch (error) {
      console.error('Permission request failed:', error);
      setContactsPermission('denied');
    } finally {
      setLoadingContacts(false);
    }
  };

  // Search filtering
  useEffect(() => {
    if (!searchQuery) {
      setFilteredContacts(contacts);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = contacts.filter(contact => {
        const matchesName = contact.name.toLowerCase().includes(query);
        const matchesPhone = contact.phoneNumbers && contact.phoneNumbers.some((p: any) => 
          p.number && p.number.replace(/[^0-9]/g, '').includes(query.replace(/[^0-9]/g, ''))
        );
        return matchesName || matchesPhone;
      });
      setFilteredContacts(filtered);
    }
  }, [searchQuery, contacts]);

  const handleContactSelect = (contact: ContactItem) => {
    setShowContactsModal(false);
    let rawPhone = '';
    if (contact.phoneNumbers && contact.phoneNumbers.length > 0) {
      rawPhone = contact.phoneNumbers[0].number;
    }
    const cleanPhone = rawPhone.replace(/[^0-9]/g, '');
    let upi = '';
    if (cleanPhone) {
      const phoneDigits = cleanPhone.length > 10 ? cleanPhone.slice(-10) : cleanPhone;
      upi = `${phoneDigits}@okaxis`;
    } else {
      upi = contact.name.toLowerCase().replace(/[^a-z0-9]/g, '') + '@okaxis';
    }
    router.push({
      pathname: '/chat-details',
      params: {
        recipientName: contact.name,
        recipientUpiId: upi,
        recipientImage: '',
        type: 'person'
      }
    } as any);
  };

  const getGroupedContacts = () => {
    const groups: { [key: string]: ContactItem[] } = {};
    filteredContacts.forEach(contact => {
      const firstL = contact.name.charAt(0).toUpperCase();
      const key = /[A-Z]/.test(firstL) ? firstL : '#';
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(contact);
    });
    
    return Object.keys(groups)
      .sort((a, b) => {
        if (a === '#') return 1;
        if (b === '#') return -1;
        return a.localeCompare(b);
      })
      .map(key => ({
        title: key,
        data: groups[key],
      }));
  };

  const groupedContacts = getGroupedContacts();

  const bills = [
    { id: 'b_jio', name: 'Jio Prepaid', type: 'image', image: require('@/assets/images/jio.png') },
    { id: '2', name: 'Mobile recharge', icon: 'phone-portrait-outline' },
    { id: '3', name: 'DTH / Cable\nTV', icon: 'tv-outline' },
    { id: '4', name: 'Electricity', icon: 'bulb-outline' },
    { id: '5', name: 'Credit cards', icon: 'card-outline' },
    { id: '6', name: 'Water', icon: 'water-outline' },
    { id: '7', name: 'Loan EMI', icon: 'document-text-outline' },
    { id: '8', name: 'Broadband /\nLandline', icon: 'wifi-outline' },
  ];

  const displayedPeople: PersonItem[] = showAllPeople 
    ? [
        { id: 'pocket_money', name: 'Pocket Money', type: 'icon', icon: 'heart-handshake', color: '#e8f0fe' },
        ...sortedPeople,
        { id: 'less', name: 'Less', type: 'icon', icon: 'chevron-up', color: themeInputBg, isToggle: true }
      ]
    : [
        { id: 'pocket_money', name: 'Pocket Money', type: 'icon', icon: 'heart-handshake', color: '#e8f0fe' },
        ...sortedPeople.slice(0, 6),
        { id: 'more', name: 'More', type: 'icon', icon: 'chevron-down', color: themeInputBg, isToggle: true }
      ];

  const displayedBusinesses: BusinessItem[] = showAllBusinesses
    ? [
        ...sortedBusinesses,
        { id: 'less', name: 'Less', letter: '', color: themeInputBg, isToggle: true, icon: 'chevron-up' }
      ]
    : [
        ...sortedBusinesses.slice(0, 3),
        { id: 'more', name: 'More', letter: '', color: themeInputBg, isToggle: true, icon: 'chevron-down' }
      ];

  return (
    <View style={[styles.safeArea, { backgroundColor: themeBgColor }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      
      {/* 1. FIXED BACKGROUND BANNER IMAGE (NON-SCROLLABLE) */}
      <View style={styles.topSectionContainer}>
        <Image
          source={require('@/assets/images/glad_you_are_here.png')}
          style={styles.heroImage}
          resizeMode="cover"
        />
      </View>

      {/* 2. FIXED FLOATING HEADER SEARCH ROW */}
      <View style={styles.floatingHeaderRow}>
        <View style={[styles.searchBar, { backgroundColor: themeCardBg }]}>
          <Ionicons name="search" size={20} color={themeSubTextColor} style={styles.searchIcon} />
          <View style={styles.searchPhraseContainer}>
            <Animated.Text
              style={[
                styles.searchPhraseText,
                {
                  color: themeSubTextColor,
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              {phrases[phraseIndex]}
            </Animated.Text>
          </View>
        </View>
        
        <TouchableOpacity style={styles.avatarButton} onPress={() => router.push('/profile' as any)}>
          <View style={[styles.avatarCircle, { backgroundColor: '#2e7d32' }]}>
            <Text style={styles.avatarText}>{firstLetter}</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* 3. SCROLLABLE CONTENTS SLIDING OVER BANNER */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContainer} 
        showsVerticalScrollIndicator={false}
      >
        {/* Main Content Container overlaying background banner */}
        <View style={[styles.mainContentContainer, { backgroundColor: themeBgColor }]}>

        {/* 3. ACTION ROW (1 row, 4 items) */}
        <View style={styles.actionRowContainer}>
          {/* Column 1: Scan QR */}
          <TouchableOpacity 
            style={styles.actionItem}
            onPress={() => router.push('/scan-qr' as any)}
          >
            <View style={[styles.iconWrapper, { backgroundColor: '#a5ccffac' }]}>
              <Image 
                source={require('@/assets/images/scan_icon_custom2.png')} 
                style={{ width: 26, height: 30, tintColor: '#044eaeff' }} 
                resizeMode="contain" 
              />
            </View>
            <Text style={[styles.actionLabel, { color: themeTextColor }]}>Scan any{'\n'}QR code</Text>
          </TouchableOpacity>

          {/* Column 2: Pay anyone */}
          <TouchableOpacity 
            style={styles.actionItem}
            onPress={handlePayAnyonePress}
          >
            <View style={[styles.iconWrapper, { backgroundColor: '#bcdeffc2' }]}>
              <Image 
                source={require('@/assets/images/pay_anyone_custom2.png')} 
                style={{ width: 26, height: 36, tintColor: '#044eaeff' }} 
                resizeMode="contain" 
              />
            </View>
            <Text style={[styles.actionLabel, { color: themeTextColor }]}>Pay{'\n'}anyone</Text>
          </TouchableOpacity>

          {/* Column 3: Bank transfer */}
          <TouchableOpacity style={styles.actionItem}>
            <View style={[styles.iconWrapper, { backgroundColor: '#bcdeffc2' }]}>
              <MaterialIcons name="account-balance" size={26} color="#044eaeff" />
            </View>
            <Text style={[styles.actionLabel, { color: themeTextColor }]}>Bank{'\n'}transfer</Text>
          </TouchableOpacity>

          {/* Column 4: Mobile recharge */}
          <TouchableOpacity style={styles.actionItem}>
            <View style={[styles.iconWrapper, { backgroundColor: '#bcdeffc2' }]}>
              <MaterialIcons name="phone-android" size={26} color="#044eaeff" />
            </View>
            <Text style={[styles.actionLabel, { color: themeTextColor }]}>Mobile{'\n'}recharge</Text>
          </TouchableOpacity>
        </View>

        {/* 4. THREE PILL CAPSULES (Horizontally Scrollable) */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.pillsScrollContainer}
          contentContainerStyle={styles.pillsScrollContent}
        >
          {/* Pill 1: UPI Lite */}
          <TouchableOpacity 
            style={[styles.pillCard, { backgroundColor: themeCardBg, borderColor: themeBorderColor }]}
            onPress={() => router.push('/upi-lite' as any)}
          >
            <View style={[styles.pillIconCircle, { backgroundColor: '#e8f0fe' }]}>
              <Ionicons name="rocket" size={18} color="#1a73e8" />
            </View>
            <View style={styles.pillTextColumn}>
              <Text style={[styles.pillTitle, { color: themeTextColor }]}>UPI Lite</Text>
              <Text style={styles.pillActionText}>Activate</Text>
            </View>
          </TouchableOpacity>

          {/* Pill 2: Rewards */}
          <TouchableOpacity 
            style={[styles.pillCard, { backgroundColor: themeCardBg, borderColor: themeBorderColor }]}
            onPress={() => router.push('/rewards' as any)}
          >
            <View style={[styles.pillIconCircle, { backgroundColor: '#fff0d4' }]}>
              <Ionicons name="trophy" size={18} color="#ff9800" />
            </View>
            <View style={styles.pillTextColumn}>
              <Text style={[styles.pillTitle, { color: themeTextColor }]}>Rewards</Text>
              <Text style={[styles.pillValueText, { color: themeTextColor }]}>₹28</Text>
            </View>
          </TouchableOpacity>

          {/* Pill 3: UPI ID (Opens My QR code screen matching Image 1) */}
          <TouchableOpacity 
            style={[styles.pillCard, { backgroundColor: themeCardBg, borderColor: themeBorderColor }]}
            onPress={() => router.push('/my-qr' as any)}
          >
            <View style={[styles.pillIconCircle, { backgroundColor: '#ffffff', overflow: 'hidden' }]}>
              <Image 
                source={require('@/assets/images/upi_logo.png')} 
                style={{ width: '100%', height: '100%' }} 
                resizeMode="contain" 
              />
            </View>
            <View style={styles.pillTextColumn}>
              <Text style={[styles.pillTitle, { color: themeTextColor }]}>UPI ID</Text>
              <Text style={[styles.pillValueText, { color: themeTextColor }]} numberOfLines={1} ellipsizeMode="tail">
                {upiId}
              </Text>
            </View>
          </TouchableOpacity>
        </ScrollView>

        {/* 5. PEOPLE SECTION */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: themeTextColor }]}>People</Text>
          
          <View style={styles.peopleGrid}>
            {displayedPeople.map(person => (
              <TouchableOpacity 
                key={person.id} 
                style={styles.personItem}
                onPress={() => {
                  if (person.isToggle) {
                    setShowAllPeople(!showAllPeople);
                  } else if (person.id === 'pocket_money') {
                    router.push('/pocket-money' as any);
                  } else if (person.name === 'Self transfer') {
                    router.push('/self-transfer' as any);
                  } else {
                    router.push({
                      pathname: '/chat-details',
                      params: {
                        recipientName: person.name,
                        recipientUpiId: person.name.toLowerCase().replace(/[^a-z0-9]/g, '') + '@okaxis',
                        recipientImage: person.type === 'image' ? person.id : '',
                        type: 'person'
                      }
                    } as any);
                  }
                }}
              >
                <View style={[
                  styles.personCircle, 
                  { backgroundColor: person.color || '#fff', overflow: 'hidden', borderWidth: (person.isToggle || person.id === 'pocket_money') ? 1 : 0, borderColor: themeBorderColor }
                ]}>
                  {person.id === 'pocket_money' ? (
                    <Image source={require('@/assets/images/heart_handshake.png')} style={{ width: 30, height: 30,tintColor: themeTextColor }} resizeMode="contain" />
                  ) : person.type === 'image' ? (
                    <Image source={person.image} style={{ width: '100%', height: '100%' }} />
                  ) : person.type === 'icon' ? (
                    <Ionicons name={person.icon as any} size={22} color={person.isToggle ? themeTextColor : "#ffffff"} />
                  ) : (
                    <Text style={styles.personLetter}>{person.letter}</Text>
                  )}
                </View>
                <Text style={[styles.personName, { color: themeTextColor }]} numberOfLines={1}>
                  {person.id === 'pocket_money' || person.name === 'Self transfer' || person.isToggle 
                    ? person.name 
                    : (person.name.includes(' ') ? person.name.split(' ')[0] + '..' : person.name)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 6. BILLS & RECHARGES SECTION */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionTitle, { color: themeTextColor }]}>Bills & recharges</Text>
            <TouchableOpacity style={styles.manageButton}>
              <Text style={styles.manageButtonText}>Manage</Text>
              <Ionicons name="chevron-forward" size={14} color="#1a73e8" />
            </TouchableOpacity>
          </View>

          <View style={styles.gridRow}>
            {bills.map(bill => (
              <TouchableOpacity 
                key={bill.id} 
                style={styles.actionItem}
                onPress={() => {
                  if (bill.id === 'b_jio') {
                    router.push({
                      pathname: '/chat-details',
                      params: {
                        recipientName: 'Jio Prepaid',
                        recipientUpiId: 'jioprepaid@okaxis',
                        recipientImage: 'b_jio',
                        type: 'business'
                      }
                    } as any);
                  } else {
                    alert(`${bill.name.replace('\n', ' ')} clicked`);
                  }
                }}
              >
                <View style={[styles.iconWrapper, { backgroundColor: themeInputBg, overflow: 'hidden' }]}>
                  {bill.type === 'image' ? (
                    <Image source={bill.image} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                  ) : (
                    <Ionicons name={bill.icon as any} size={28} color={isDark ? '#ffffff' : '#202124'} />
                  )}
                </View>
                <Text style={[styles.actionLabel, { color: themeTextColor }]} numberOfLines={2}>{bill.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 7. BUSINESSES SECTION */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: themeTextColor }]}>Businesses</Text>
          
          <View style={styles.peopleGrid}>
            {displayedBusinesses.map(business => (
              <TouchableOpacity 
                key={business.id} 
                style={styles.personItem}
                onPress={() => {
                  if (business.isToggle) {
                    setShowAllBusinesses(!showAllBusinesses);
                  } else {
                    router.push({
                      pathname: '/chat-details',
                      params: {
                        recipientName: business.name,
                        recipientUpiId: business.name.toLowerCase().replace(/[^a-z0-9]/g, '') + '@okaxis',
                        recipientImage: business.type === 'image' ? business.id : '',
                        type: 'business'
                      }
                    } as any);
                  }
                }}
              >
                <View style={[
                  styles.personCircle, 
                  { backgroundColor: business.color || themeInputBg, overflow: 'hidden', borderWidth: (business.isToggle || business.type === 'image') ? 1 : 0, borderColor: themeBorderColor }
                ]}>
                  {business.isToggle ? (
                    <Ionicons name={business.icon as any} size={20} color={themeTextColor} />
                  ) : business.type === 'image' ? (
                    business.logoUri ? (
                      <Image 
                        source={{ uri: business.logoUri }} 
                        style={{ width: '100%', height: '100%' }} 
                        resizeMode="contain" 
                      />
                    ) : business.domain ? (
                      <Image 
                        source={{ uri: `https://logos.hunter.io/${business.domain}` }} 
                        style={{ width: '100%', height: '100%' }} 
                        resizeMode="contain" 
                      />
                    ) : (
                      <Image source={business.image} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                    )
                  ) : (
                    <Text style={styles.personLetter}>{business.letter}</Text>
                  )}
                </View>
                <Text style={[styles.personName, { color: themeTextColor }]} numberOfLines={1}>
                  {business.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 8. GIFT CARDS & MORE */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: themeTextColor }]}>Gift cards & more</Text>
          <View style={styles.twoColumnRow}>
            {/* Column 1: Subscriptions */}
            <TouchableOpacity style={[styles.cardHalf, { backgroundColor: isDark ? '#202124' : '#f8fafd', borderColor: 'transparent' }]}>
              <View style={styles.cardIconWrapper}>
                <MaterialIcons name="cast" size={24} color="#0b57d0" />
              </View>
              <Text style={[styles.cardTitle, { color: themeTextColor }]}>Subscriptions</Text>
              <Text style={[styles.cardDesc, { color: themeSubTextColor }]}>Buy plans from leading OTT platforms</Text>
              
              <View style={styles.cardLogoRow}>
                {['zee5.com', 'jiocinema.com', 'primevideo.com'].map((domain, index) => (
                  <View key={index} style={[styles.cardMiniCircle, { borderColor: themeBorderColor }]}>
                    <Image 
                      source={{ uri: `https://logos.hunter.io/${domain}` }} 
                      style={{ width: '100%', height: '100%' }} 
                      resizeMode="contain" 
                    />
                  </View>
                ))}
              </View>
            </TouchableOpacity>

            {/* Column 2: Gift cards */}
            <TouchableOpacity style={[styles.cardHalf, { backgroundColor: isDark ? '#202124' : '#f8fafd', borderColor: 'transparent' }]}>
              <View style={styles.cardIconWrapper}>
                <MaterialCommunityIcons name="gift" size={24} color="#0b57d0" />
              </View>
              <Text style={[styles.cardTitle, { color: themeTextColor }]}>Gift cards</Text>
              <Text style={[styles.cardDesc, { color: themeSubTextColor }]}>Buy gift cards from the biggest brands</Text>

              <View style={styles.cardLogoRow}>
                {['flipkart.com', 'amazon.in', 'myntra.com'].map((domain, index) => (
                  <View key={index} style={[styles.cardMiniCircle, { borderColor: themeBorderColor }]}>
                    <Image 
                      source={{ uri: `https://logos.hunter.io/${domain}` }} 
                      style={{ width: '100%', height: '100%' }} 
                      resizeMode="contain" 
                    />
                  </View>
                ))}
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* 9. OFFERS & REWARDS */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: themeTextColor }]}>Offers & rewards</Text>
          
          {/* Row of Three Circular Icons */}
          <View style={styles.rewardsRow}>
            {/* Rewards */}
            <TouchableOpacity 
              style={styles.rewardsCircleItem}
              onPress={() => alert("Rewards dashboard: You earned ₹28!")}
            >
              <LinearGradient
                colors={['#ffeb3b', '#ffeb3b', '#f57c00', '#f57c00']}
                locations={[0, 0.6, 0.5, 1]}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                style={styles.rewardsCircle}
              >
                <Image 
                  source={require('@/assets/images/rewards_icon.png')} 
                  style={{ width: 28, height: 28, tintColor: '#ffffff' }}
                  resizeMode="contain"
                />
              </LinearGradient>
              <Text style={[styles.rewardsLabel, { color: themeTextColor }]}>Rewards</Text>
            </TouchableOpacity>

            {/* Offers */}
            <TouchableOpacity 
              style={styles.rewardsCircleItem}
              onPress={() => alert("Offers: Flat ₹50 back on mobile recharges!")}
            >
              <LinearGradient
                colors={['#d81b60', '#ff8a80']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.rewardsCircle}
              >
                <Image 
                  source={require('@/assets/images/offers_icon.png')} 
                  style={{ width: 28, height: 28, tintColor: '#ffffff' }}
                  resizeMode="contain"
                />
              </LinearGradient>
              <Text style={[styles.rewardsLabel, { color: themeTextColor }]}>Offers</Text>
            </TouchableOpacity>

            {/* Referrals */}
            <TouchableOpacity 
              style={styles.rewardsCircleItem}
              onPress={() => alert("Invite friends to Google Pay. Get ₹101 when they make their first payment!")}
            >
              <LinearGradient
                colors={['#1a73e8', '#8ab4f8']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.rewardsCircle}
              >
                <Image 
                  source={require('@/assets/images/referrals_icon.png')} 
                  style={{ width: 28, height: 28, tintColor: '#ffffff' }}
                  resizeMode="contain"
                />
              </LinearGradient>
              <Text style={[styles.rewardsLabel, { color: themeTextColor }]}>Referrals</Text>
            </TouchableOpacity>
          </View>

          {/* Loan amount banner card */}
          <View style={[styles.welcomeBackCard, { backgroundColor: isDark ? '#202124' : '#f8fafd' }]}>
            <View style={styles.welcomeLeft}>
              <Text style={[styles.welcomeTitle, { color: themeTextColor }]}>Loan amount in account,{'\n'}in under 24 hrs</Text>
              <TouchableOpacity onPress={() => alert("Personal loan application dashboard")} style={{ marginTop: 18 }}>
                <Text style={styles.welcomeLink}>Apply now</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.welcomeRight}>
              <Image 
                source={require('@/assets/images/scratch_card.png')} 
                style={styles.welcomeImage} 
                resizeMode="contain" 
              />
            </View>
          </View>
        </View>

        {/* 10. MANAGE YOUR MONEY */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: themeTextColor }]}>Manage your money</Text>
          
          {/* Two-Column Cards Grid for Loans */}
          <View style={[styles.twoColumnRow, { marginBottom: 16 }]}>
            {/* Card 1: Personal Loan */}
            <TouchableOpacity 
              style={[styles.loanCard, { backgroundColor: isDark ? '#202124' : '#f8fafd', borderColor: 'transparent' }]}
              onPress={() => alert("Personal loan application dashboard")}
            >
              <View style={styles.cardIconWrapper}>
                <Image 
                  source={require('@/assets/images/personal_loan_blue_outline.png')} 
                  style={{ width: 26, height: 26 }} 
                  resizeMode="contain" 
                />
              </View>
              <Text style={[styles.loanTitle, { color: themeTextColor }]}>Personal loan</Text>
              <Text style={[styles.loanDesc, { color: themeSubTextColor }]}>
                Up to ₹40 lakh, instant approval
              </Text>
              <Text style={styles.loanLink}>Check details</Text>
            </TouchableOpacity>

            {/* Card 2: Gold Loan */}
            <TouchableOpacity 
              style={[styles.loanCard, { backgroundColor: isDark ? '#202124' : '#f8fafd', borderColor: 'transparent' }]}
              onPress={() => alert("Gold loan application dashboard")}
            >
              <View style={styles.cardIconWrapper}>
                <Image 
                  source={require('@/assets/images/gold_loan_blue_outline.png')} 
                  style={{ width: 26, height: 26 }} 
                  resizeMode="contain" 
                />
              </View>
              <Text style={[styles.loanTitle, { color: themeTextColor }]}>Gold loan</Text>
              <Text style={[styles.loanDesc, { color: themeSubTextColor }]}>
                Interest rate starting at 0.96% monthly
              </Text>
              <Text style={styles.loanLink}>Apply now</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.listContainer}>
            {/* Check CIBIL Score */}
            <TouchableOpacity 
              style={styles.listItem}
              onPress={() => setShowCibilModal(true)}
            >
              <Image 
                source={require('@/assets/images/cibil_icon.png')} 
                style={[styles.listItemIcon, { width: 26, height: 26, tintColor: '#0b57d0' }]} 
                resizeMode="contain" 
              />
              <Text style={[styles.listItemText, { color: themeTextColor }]}>Check your CIBIL score for free</Text>
              <Ionicons name="chevron-forward" size={18} color={themeSubTextColor} />
            </TouchableOpacity>

            {/* Transaction History */}
            <TouchableOpacity 
              style={styles.listItem}
              onPress={() => router.navigate('/(tabs)/money')}
            >
              <Image 
                source={require('@/assets/images/history_icon.png')} 
                style={[styles.listItemIcon, { width: 26, height: 26, tintColor: '#0b57d0' }]} 
                resizeMode="contain" 
              />
              <Text style={[styles.listItemText, { color: themeTextColor }]}>See transaction history</Text>
              <Ionicons name="chevron-forward" size={18} color={themeSubTextColor} />
            </TouchableOpacity>

            {/* Check Bank Balance */}
            <TouchableOpacity 
              style={styles.listItem}
              onPress={() => setShowBalanceModal(true)}
            >
              <MaterialCommunityIcons name="bank" size={26} color="#0b57d0" style={styles.listItemIcon} />
              <Text style={[styles.listItemText, { color: themeTextColor }]}>Check bank balance</Text>
              <Ionicons name="chevron-forward" size={18} color={themeSubTextColor} />
            </TouchableOpacity>
          </View>
        </View>

      {/* ================= MODAL: CIBIL SCORE ================= */}
      <Modal visible={showCibilModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: themeBgColor }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: themeTextColor }]}>Credit Score (CIBIL)</Text>
              <TouchableOpacity onPress={() => setShowCibilModal(false)}>
                <Ionicons name="close" size={24} color={themeTextColor} />
              </TouchableOpacity>
            </View>

            {/* Speedometer Circle Visualization */}
            <View style={styles.cibilChartContainer}>
              <View style={[styles.cibilGaugeOutline, { borderColor: themeBorderColor }]}>
                <Text style={[styles.cibilScoreValue, { color: '#34a853' }]}>785</Text>
                <Text style={[styles.cibilScoreText, { color: themeSubTextColor }]}>Excellent</Text>
              </View>
            </View>

            <View style={styles.cibilDetailsCard}>
              <Text style={[styles.cibilDetailsTitle, { color: themeTextColor }]}>Your Credit Health is Great!</Text>
              <Text style={[styles.cibilDetailsDesc, { color: themeSubTextColor }]}>
                A score of 785 places you in the top 10% of national borrowers. You qualify for prime interest rates on personal and gold loans!
              </Text>
            </View>

            {/* Mock Tips */}
            <Text style={[styles.tipsSectionTitle, { color: themeTextColor }]}>Tips to keep it high:</Text>
            
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle-outline" size={18} color="#34a853" style={{ marginRight: 10 }} />
              <Text style={[styles.tipText, { color: themeTextColor }]}>Pay all loan EMIs and credit cards on time.</Text>
            </View>

            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle-outline" size={18} color="#34a853" style={{ marginRight: 10 }} />
              <Text style={[styles.tipText, { color: themeTextColor }]}>Keep credit card usage below 30% of the limit.</Text>
            </View>

            <TouchableOpacity 
              style={[styles.closeModalButton, { backgroundColor: '#1a73e8' }]}
              onPress={() => setShowCibilModal(false)}
            >
              <Text style={styles.closeModalButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ================= MODAL: BANK BALANCE SELECTOR ================= */}
      <Modal visible={showBalanceModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: themeBgColor }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: themeTextColor }]}>Select Account</Text>
              <TouchableOpacity onPress={() => setShowBalanceModal(false)}>
                <Ionicons name="close" size={24} color={themeTextColor} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.modalLabel, { color: themeSubTextColor, marginBottom: 12 }]}>
              Choose bank account to check balance
            </Text>

            {bankAccountsList.length === 0 ? (
              <View style={styles.noAccountsWrapper}>
                <Ionicons name="card-outline" size={32} color={themeSubTextColor} style={{ marginBottom: 8 }} />
                <Text style={[styles.noAccountsText, { color: themeSubTextColor }]}>
                  No linked bank accounts found. Please link a bank account.
                </Text>
                <TouchableOpacity 
                  style={[styles.linkBankBtn, { backgroundColor: '#1a73e8' }]}
                  onPress={() => {
                    setShowBalanceModal(false);
                    router.push('/add-bank' as any);
                  }}
                >
                  <Text style={styles.linkBankBtnText}>Add Bank Account</Text>
                </TouchableOpacity>
              </View>
            ) : (
              bankAccountsList.map((acc, index) => (
                <TouchableOpacity 
                  key={index} 
                  style={[styles.bankAccountRow, { backgroundColor: themeInputBg }]}
                  onPress={() => {
                    setShowBalanceModal(false);
                    router.push({
                      pathname: '/check-balance' as any,
                      params: {
                        bankName: acc.bankName,
                        accountNumber: acc.accountNumber,
                      }
                    });
                  }}
                >
                  <Ionicons name="business" size={20} color="#1a73e8" style={{ marginRight: 12 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.bankAccName, { color: themeTextColor }]}>{acc.bankName}</Text>
                    <Text style={[styles.bankAccNum, { color: themeSubTextColor }]}>Account: •••• {acc.accountNumber.slice(-4)}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={themeSubTextColor} />
                </TouchableOpacity>
              ))
            )}
          </View>
        </View>
      </Modal>

      {/* ================= MODAL: CONTACTS SELECTOR (PAY ANYONE) ================= */}
      <Modal visible={showContactsModal} animationType="slide" transparent={false} onRequestClose={() => setShowContactsModal(false)}>
        <SafeAreaView style={[styles.safeArea, { backgroundColor: themeBgColor }]}>
          {/* Header */}
          <View style={[styles.contactsHeader, { borderBottomColor: themeBorderColor }]}>
            <TouchableOpacity onPress={() => setShowContactsModal(false)}>
              <Ionicons name="arrow-back" size={24} color={themeTextColor} />
            </TouchableOpacity>
            <Text style={[styles.contactsTitle, { color: themeTextColor }]}>Pay anyone</Text>
          </View>

          {/* Search bar */}
          <View style={[styles.contactsSearchContainer, { backgroundColor: themeCardBg, borderColor: themeBorderColor }]}>
            <Ionicons name="search" size={20} color={themeSubTextColor} />
            <TextInput
              style={[styles.contactsSearchInput, { color: themeTextColor }]}
              placeholder="Search by name or phone number"
              placeholderTextColor={themeSubTextColor}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.contactsClearButton}>
                <Ionicons name="close-circle" size={18} color={themeSubTextColor} />
              </TouchableOpacity>
            )}
          </View>

          {/* Body */}
          {loadingContacts ? (
            <View style={styles.contactsLoadingContainer}>
              <ActivityIndicator size="large" color="#1a73e8" />
              <Text style={[styles.contactsLoadingText, { color: themeSubTextColor }]}>Loading contacts...</Text>
            </View>
          ) : contactsPermission === 'denied' ? (
            <View style={styles.permissionDeniedContainer}>
              <View style={[styles.permissionIconCircle, { backgroundColor: isDark ? 'rgba(234,67,53,0.1)' : '#fce8e6' }]}>
                <Ionicons name="people-outline" size={40} color="#ea4335" />
              </View>
              <Text style={[styles.permissionTitle, { color: themeTextColor }]}>Access Contacts</Text>
              <Text style={[styles.permissionDesc, { color: themeSubTextColor }]}>
                Google Pay needs access to your contacts so you can easily pay your friends and family.
              </Text>
              <TouchableOpacity
                style={[styles.permissionBtn, { backgroundColor: '#1a73e8' }]}
                onPress={handleRequestPermissionAgain}
              >
                <Text style={styles.permissionBtnText}>Grant Access</Text>
              </TouchableOpacity>
            </View>
          ) : filteredContacts.length === 0 ? (
            <View style={styles.noContactsContainer}>
              <Ionicons name="search-outline" size={48} color={themeSubTextColor} style={{ marginBottom: 12 }} />
              <Text style={[styles.noContactsText, { color: themeSubTextColor }]}>No contacts found matching &quot;{searchQuery}&quot;</Text>
            </View>
          ) : (
            <ScrollView 
              style={styles.contactsScrollList} 
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {groupedContacts.map(group => (
                <View key={group.title}>
                  <Text style={[styles.contactSectionHeader, { color: themeSubTextColor }]}>{group.title}</Text>
                  {group.data.map(contact => {
                    const avatarColor = getAvatarColor(contact.name);
                    const initial = contact.name.charAt(0).toUpperCase();
                    const phone = contact.phoneNumbers && contact.phoneNumbers.length > 0
                      ? contact.phoneNumbers[0].number
                      : 'No phone number';
                    return (
                      <TouchableOpacity
                        key={contact.id}
                        style={[styles.contactItemRow, { backgroundColor: 'transparent' }]}
                        onPress={() => handleContactSelect(contact)}
                      >
                        <View style={[styles.contactAvatar, { backgroundColor: avatarColor }]}>
                          <Text style={styles.contactAvatarText}>{initial}</Text>
                        </View>
                        <View style={styles.contactInfo}>
                          <Text style={[styles.contactItemName, { color: themeTextColor }]}>{contact.name}</Text>
                          <Text style={[styles.contactItemPhone, { color: themeSubTextColor }]}>{phone}</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={16} color={themeSubTextColor} />
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ))}
            </ScrollView>
          )}
        </SafeAreaView>
      </Modal>

        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContainer: {
    paddingTop: 250,
    paddingBottom: 0,
  },
  scrollView: {
    flex: 1,
    backgroundColor: 'transparent',
    zIndex: 2,
  },
  topSectionContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 270,
    zIndex: 1,
  },
  floatingHeaderRow: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 52 : 36,
    marginTop: -20,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 10,
  },
  mainContentContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 24,
    minHeight: 800,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 24,
    height: 48,
    paddingHorizontal: 16,
    marginRight: 12,
    marginTop:30,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '400',
  },
  searchPhraseContainer: {
    flex: 1,
    height: 40,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  searchPhraseText: {
    fontSize: 16,
    fontWeight: '400',
  },
  avatarButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop:35,
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  actionRowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    paddingVertical: 8,
    marginBottom: 25,
  },
  actionItem: {
    width: '22%',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconWrapper: {
    width: 62,
    height: 62,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionLabel: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
    fontWeight: '900',
  },
  pillsScrollContainer: {
    width: '100%',
    marginBottom: 25,
  },
  pillsScrollContent: {
    paddingRight: 16,
  },
  pillCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor:'#ffffff86',
    borderRadius: 50,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginRight: 10,
    minWidth: 135,
    maxWidth: 200,
  },
  pillIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 46,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
    marginLeft:-8,
  },
  pillTextColumn: {
    flex: 1,
    justifyContent: 'center',
  },
  pillTitle: {
    fontSize: 11,
    fontWeight: '800',
  },
  pillActionText: {
    color: '#1a73e8',
    fontSize: 12,
    fontWeight: '800',
  },
  pillValueText: {
    fontSize: 11,
    fontWeight: '800',
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 17.5,
    fontWeight: '900',
    marginBottom: 16,
    letterSpacing: -0.2,
  },
  manageButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  manageButtonText: {
    color: '#1a73e8',
    fontSize: 14,
    fontWeight: '700',
    marginRight: 2,
  },
  gridRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  peopleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  personItem: {
    width: '22%',
    alignItems: 'center',
    marginBottom: 20,
  },
  personCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  personLetter: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  personName: {
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '900',
  },
  twoColumnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardHalf: {
    width: '48%',
    flexDirection: 'column',
    alignItems: 'flex-start',
    borderWidth: 0,
    borderColor: 'transparent',
    borderRadius: 20,
    padding: 14,
  },
  cardIconWrapper: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginTop: 6,
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
    marginBottom: 16,
  },
  cardLogoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 'auto',
  },
  cardMiniCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: '#ffffff',
    overflow: 'hidden',
    marginRight: -6,
  },
  listContainer: {
    width: '100%',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 0,
    borderColor: 'transparent',
    backgroundColor: 'transparent',
    paddingVertical: 14,
    paddingHorizontal: 4,
    marginBottom: 4,
    shadowColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
  },
  listItemIcon: {
    marginRight: 16,
  },
  listItemText: {
    flex: 1,
    fontSize: 15.5,
    fontWeight: '900',
  },
  rewardsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginTop: 4,
    marginBottom: 8,
  },
  rewardsCircleItem: {
    alignItems: 'center',
    marginRight: 24,
  },
  rewardsCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  rewardsLabel: {
    fontSize: 13,
    fontWeight: '900',
  },
  welcomeBackCard: {
    flexDirection: 'row',
    borderRadius: 20,
    padding: 20,
    marginTop: 10,
    alignItems: 'center',
  },
  welcomeLeft: {
    flex: 1,
    paddingRight: 8,
  },
  welcomeTitle: {
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 22,
  },
  welcomeDesc: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
    marginBottom: 12,
  },
  welcomeLink: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0b57d0',
  },
  welcomeRight: {
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  welcomeImage: {
    width: 100,
    height: 85,
  },
  loanCard: {
    width: '48%',
    borderWidth: 0,
    borderColor: 'transparent',
    borderRadius: 20,
    padding: 16,
    shadowColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
  },
  loanIcon: {
    width: 32,
    height: 32,
    marginBottom: 8,
  },
  loanTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 4,
  },
  loanDesc: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
    marginBottom: 12,
  },
  loanLink: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1a73e8',
    marginTop: 'auto',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  cibilChartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  cibilGaugeOutline: {
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cibilScoreValue: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  cibilScoreText: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 2,
  },
  cibilDetailsCard: {
    borderRadius: 12,
    padding: 16,
    backgroundColor: 'rgba(52, 168, 83, 0.05)',
    marginBottom: 16,
  },
  cibilDetailsTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  cibilDetailsDesc: {
    fontSize: 12,
    lineHeight: 16,
  },
  tipsSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 10,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tipText: {
    fontSize: 13,
    flex: 1,
  },
  closeModalButton: {
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  closeModalButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  modalLabel: {
    fontSize: 14,
  },
  noAccountsWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
  },
  noAccountsText: {
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 16,
  },
  linkBankBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  linkBankBtnText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  bankAccountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
  },
  bankAccName: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  bankAccNum: {
    fontSize: 12,
    marginTop: 2,
  },
  // Contacts Modal Styles
  contactsModalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  contactsModalContent: {
    flex: 1,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 16,
  },
  contactsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  contactsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 16,
    flex: 1,
  },
  contactsSearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 12,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
  },
  contactsSearchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  contactsClearButton: {
    padding: 4,
  },
  contactsLoadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40,
  },
  contactsLoadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  permissionDeniedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 40,
  },
  permissionIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  permissionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  permissionDesc: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  permissionBtn: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 24,
  },
  permissionBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  contactsScrollList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  contactSectionHeader: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    paddingLeft: 8,
  },
  contactItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginVertical: 2,
  },
  contactAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  contactAvatarText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  contactInfo: {
    flex: 1,
  },
  contactItemName: {
    fontSize: 16,
    fontWeight: '600',
  },
  contactItemPhone: {
    fontSize: 13,
    marginTop: 2,
  },
  noContactsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  noContactsText: {
    fontSize: 14,
    textAlign: 'center',
  },
});
