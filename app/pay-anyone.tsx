import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  useColorScheme,
  StatusBar,
  Animated,
  Platform,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Svg, { Path } from 'react-native-svg';

// Dynamically import expo-contacts to prevent native module load-time crashes
let Contacts: any = null;
try {
  Contacts = require('expo-contacts');
} catch (e) {
  // Fallback
}

interface ContactItem {
  id: string;
  name: string;
  phone: string;
  letter: string;
  color: string;
}

const MOCK_CONTACTS: ContactItem[] = [
  { id: 'c1', name: 'Aarav Sharma', phone: '+91 98765 43210', letter: 'A', color: '#1a73e8' },
  { id: 'c2', name: 'Aditi Patel', phone: '+91 87654 32109', letter: 'A', color: '#ea4335' },
  { id: 'c3', name: 'Bhavana Rao', phone: '+91 76543 21098', letter: 'B', color: '#f9ab00' },
  { id: 'c4', name: 'Chaitanya Reddy', phone: '+91 65432 10987', letter: 'C', color: '#34a853' },
  { id: 'c5', name: 'Divya Nair', phone: '+91 91234 56789', letter: 'D', color: '#a142f4' },
  { id: 'c6', name: 'Eshwar Iyer', phone: '+91 92345 67890', letter: 'E', color: '#00acc1' },
  { id: 'c7', name: 'Farhan Khan', phone: '+91 93456 78901', letter: 'F', color: '#ff6d00' },
  { id: 'c8', name: 'Gauri Sen', phone: '+91 94567 89012', letter: 'G', color: '#1a73e8' },
  { id: 'c9', name: 'Hari Krishnan', phone: '+91 95678 90123', letter: 'H', color: '#ea4335' },
  { id: 'c10', name: 'Ishaan Gupta', phone: '+91 96789 01234', letter: 'I', color: '#34a853' },
];

function SlantedUpiSymbol() {
  return (
    <Svg viewBox="0 0 1024 466" style={{ width: 36, height: 16, marginHorizontal: 2 }}>
      <Path fill="#0b57d0" d="M98.1 340.7h6.3l-5.9 24.5c-.9 3.6-.7 6.4.5 8.2 1.2 1.8 3.4 2.7 6.7 2.7 3.2 0 5.9-.9 8-2.7 2.1-1.8 3.5-4.6 4.4-8.2l5.9-24.5h6.4l-6 25.1c-1.3 5.4-3.6 9.5-7 12.2-3.3 2.7-7.7 4.1-13.1 4.1-5.4 0-9.1-1.3-11.1-4s-2.4-6.8-1.1-12.2l6-25.2zm31.4 40.3 10-41.9 19 24.6c.5.7 1 1.4 1.5 2.2.5.8 1 1.7 1.6 2.7l6.7-27.9h5.9l-10 41.8-19.4-25.1-1.5-2.1c-.5-.8-.9-1.5-1.2-2.4l-6.7 28h-5.9zm44.2 0 9.6-40.3h6.4l-9.6 40.3h-6.4z" />
      <Path fill="#70706e" d="M740.7 305.6h-43.9l61-220.3h43.9l-61 220.3zM717.9 92.2c-3-4.2-7.7-6.3-14.1-6.3H462.6l-11.9 43.2h219.4l-12.8 46.1H481.8v-.1h-43.9l-36.4 131.5h43.9l24.4-88.2h197.3c6.2 0 12-2.1 17.4-6.3 5.4-4.2 9-9.4 10.7-15.6l24.4-88.2c1.9-6.6 1.3-11.9-1.7-16.1z" />
      <Path fill="#098041" d="M877.5 85.7 933 196.1 816.3 306.5z" />
      <Path fill="#e97626" d="M838.5 85.7 894 196.1 777.2 306.5z" />
    </Svg>
  );
}

export default function PayAnyoneScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [searchQuery, setSearchQuery] = useState('');
  const [contactsList, setContactsList] = useState<ContactItem[]>(MOCK_CONTACTS);
  const [recentsList, setRecentsList] = useState<ContactItem[]>([]);
  const [showContactsModal, setShowContactsModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Animated sliding placeholder state
  const [phraseIndex, setPhraseIndex] = useState(0);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const placeholderPhrases = [
    'Enter UPI ID or number',
    'Enter phone number or name',
    'Pay any UPI app'
  ];

  // Infinite bottom-to-top sliding placeholder animation
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
        setPhraseIndex(prev => (prev + 1) % placeholderPhrases.length);
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
    }, 2800);

    return () => clearInterval(interval);
  }, [fadeAnim, slideAnim, placeholderPhrases.length]);

  // Load Contacts and Recents
  useEffect(() => {
    async function loadData() {
      // 1. Recents: strictly max 3 members
      setRecentsList(MOCK_CONTACTS.slice(0, 3));

      // 2. Fetch device contacts if permission granted
      if (Platform.OS !== 'web' && Contacts && Contacts.requestPermissionsAsync) {
        try {
          const { status } = await Contacts.requestPermissionsAsync();
          if (status === 'granted') {
            const { data } = await Contacts.getContactsAsync({
              fields: [Contacts.Fields.PhoneNumbers],
            });
            if (data && data.length > 0) {
              const formatted = data
                .filter((c: any) => c.name && c.phoneNumbers && c.phoneNumbers.length > 0)
                .map((c: any, index: number) => {
                  const num = c.phoneNumbers[0].number.replace(/[^0-9]/g, '');
                  const formattedNum = num.length >= 10 ? `+91 ${num.slice(-10, -5)} ${num.slice(-5)}` : c.phoneNumbers[0].number;
                  const colors = ['#1a73e8', '#ea4335', '#f9ab00', '#34a853', '#a142f4', '#00acc1'];
                  return {
                    id: c.id || `contact_${index}`,
                    name: c.name,
                    phone: formattedNum,
                    letter: c.name.charAt(0).toUpperCase(),
                    color: colors[index % colors.length]
                  };
                });
              if (formatted.length > 0) {
                setContactsList(formatted);
              }
            }
          }
        } catch (e) {
          console.error('Error fetching contacts:', e);
        }
      }
    }
    loadData();
  }, []);

  const filteredContacts = contactsList.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.phone.replace(/[^0-9]/g, '').includes(searchQuery.replace(/[^0-9]/g, ''))
  );

  const themeBgColor = isDark ? '#121212' : '#ffffff';
  const themeCardBg = isDark ? '#202124' : '#f8fafd';
  const themeTextColor = isDark ? '#ffffff' : '#202124';
  const themeSubTextColor = isDark ? '#9aa0a6' : '#5f6368';
  const themeBorderColor = isDark ? '#3c4043' : '#dadce0';

  const handleContactPress = (contact: ContactItem) => {
    router.push({
      pathname: '/chat-details',
      params: {
        recipientName: contact.name,
        recipientUpiId: contact.name.toLowerCase().replace(/[^a-z0-9]/g, '') + '@okaxis',
        recipientImage: '',
        type: 'person'
      }
    } as any);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: themeBgColor }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      
      {/* 1. TOP HEADER - GO BACK ARROW ALONE */}
      <View style={styles.topHeaderBar}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={themeTextColor} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* 2. HEADING & SUB-SENTENCE */}
        <View style={styles.headingSection}>
          <Text style={[styles.headingTitle, { color: themeTextColor }]}>Pay anyone</Text>
          <View style={styles.subSentenceRow}>
            <Text style={[styles.subSentenceText, { color: themeSubTextColor }]}>Pay any </Text>
            <SlantedUpiSymbol />
            <Text style={[styles.subSentenceText, { color: themeSubTextColor }]}> app using name, number or UPI ID</Text>
          </View>
        </View>

        {/* 3. SHARP CORNER SEARCH BAR WITH 70% INPUT | 30% 123 + CONTACTS ICON */}
        <View style={styles.searchRowContainer}>
          <View style={[styles.sharpSearchBar, { backgroundColor: isDark ? '#202124' : '#f1f3f4', borderColor: themeBorderColor }]}>
            
            {/* SEARCH ICON */}
            <Ionicons name="search" size={20} color={themeSubTextColor} style={{ marginRight: 8 }} />

            {/* LEFT 70%: INPUT + INFINITE SLIDING ANIMATED PLACEHOLDER */}
            <View style={styles.inputWrapper70}>
              <TextInput
                style={[styles.searchInput, { color: themeTextColor }]}
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder=""
                autoCapitalize="none"
              />

              {searchQuery.length === 0 && (
                <View style={styles.animatedPlaceholderBox} pointerEvents="none">
                  <Animated.Text
                    style={[
                      styles.placeholderText,
                      {
                        color: themeSubTextColor,
                        opacity: fadeAnim,
                        transform: [{ translateY: slideAnim }],
                      },
                    ]}
                  >
                    {placeholderPhrases[phraseIndex]}
                  </Animated.Text>
                </View>
              )}
            </View>

            {/* VERTICAL DIVIDER LINE | */}
            <View style={[styles.verticalDividerLine, { backgroundColor: themeBorderColor }]} />

            {/* RIGHT 30%: 123 BLUE BADGE */}
            <View style={styles.right30Box}>
              <Text style={styles.blueNumberBadge}>123</Text>
            </View>
          </View>

          {/* CONTACTS HUMAN ICON BUTTON NEXT TO SEARCH BAR */}
          <TouchableOpacity 
            style={[styles.contactsIconButton, { backgroundColor: isDark ? '#202124' : '#e8f0fe' }]}
            onPress={() => setShowContactsModal(true)}
          >
            <MaterialIcons name="contacts" size={24} color="#0b57d0" />
          </TouchableOpacity>
        </View>

        {/* 4. RECENTS SECTION (STRICTLY MAXIMUM 3 MEMBERS ONLY) */}
        {searchQuery.length === 0 && (
          <View style={styles.sectionContainer}>
            <Text style={[styles.bigSectionTitle, { color: themeTextColor }]}>Recents</Text>

            <View style={styles.recentsList}>
              {recentsList.map(member => (
                <TouchableOpacity 
                  key={member.id} 
                  style={styles.recentItemRow}
                  onPress={() => handleContactPress(member)}
                >
                  <View style={[styles.contactAvatar, { backgroundColor: member.color }]}>
                    <Text style={styles.avatarLetterText}>{member.letter}</Text>
                  </View>
                  
                  <View style={styles.contactDetailsCol}>
                    <Text style={[styles.contactName, { color: themeTextColor }]}>{member.name}</Text>
                    <Text style={[styles.contactPhone, { color: themeSubTextColor }]}>{member.phone}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* 5. ALL PEOPLE ON UPI SECTION */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.bigSectionTitle, { color: themeTextColor }]}>All people on UPI</Text>

          {/* SPECIAL TOP 2 ITEMS */}
          {searchQuery.length === 0 && (
            <>
              {/* Item 1: Self transfer */}
              <TouchableOpacity 
                style={styles.specialActionRow}
                onPress={() => router.push('/self-transfer')}
              >
                <View style={[styles.specialIconCircle, { backgroundColor: '#e8f0fe' }]}>
                  <Ionicons name="swap-horizontal" size={24} color="#0b57d0" />
                </View>
                <View style={styles.contactDetailsCol}>
                  <Text style={[styles.specialTitle, { color: themeTextColor }]}>Self transfer</Text>
                  <Text style={[styles.contactPhone, { color: themeSubTextColor }]}>Transfer money between your accounts</Text>
                </View>
              </TouchableOpacity>

              {/* Item 2: Split expense */}
              <TouchableOpacity 
                style={styles.specialActionRow}
                onPress={() => alert('Split expense feature: Select group members to split bills')}
              >
                <View style={[styles.specialIconCircle, { backgroundColor: '#e8f0fe' }]}>
                  <MaterialCommunityIcons name="call-split" size={24} color="#0b57d0" />
                </View>
                <View style={styles.contactDetailsCol}>
                  <Text style={[styles.specialTitle, { color: themeTextColor }]}>Split expense</Text>
                  <Text style={[styles.contactPhone, { color: themeSubTextColor }]}>Share expenses with group</Text>
                </View>
              </TouchableOpacity>
            </>
          )}

          {/* ALL CONTACTS LIST */}
          <View style={styles.allContactsList}>
            {filteredContacts.map(contact => (
              <TouchableOpacity 
                key={contact.id} 
                style={styles.recentItemRow}
                onPress={() => handleContactPress(contact)}
              >
                <View style={[styles.contactAvatar, { backgroundColor: contact.color }]}>
                  <Text style={styles.avatarLetterText}>{contact.letter}</Text>
                </View>

                <View style={styles.contactDetailsCol}>
                  <Text style={[styles.contactName, { color: themeTextColor }]}>{contact.name}</Text>
                  <Text style={[styles.contactPhone, { color: themeSubTextColor }]}>{contact.phone}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* FULL CONTACTS PICKER MODAL */}
      <Modal
        visible={showContactsModal}
        animationType="slide"
        onRequestClose={() => setShowContactsModal(false)}
      >
        <SafeAreaView style={[styles.safeArea, { backgroundColor: themeBgColor }]}>
          <View style={styles.modalHeaderRow}>
            <TouchableOpacity onPress={() => setShowContactsModal(false)}>
              <Ionicons name="close" size={26} color={themeTextColor} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: themeTextColor }]}>Select Contact</Text>
            <View style={{ width: 26 }} />
          </View>

          <ScrollView style={{ flex: 1, paddingHorizontal: 20 }}>
            {contactsList.map(item => (
              <TouchableOpacity 
                key={item.id} 
                style={styles.recentItemRow}
                onPress={() => {
                  setShowContactsModal(false);
                  handleContactPress(item);
                }}
              >
                <View style={[styles.contactAvatar, { backgroundColor: item.color }]}>
                  <Text style={styles.avatarLetterText}>{item.letter}</Text>
                </View>
                <View style={styles.contactDetailsCol}>
                  <Text style={[styles.contactName, { color: themeTextColor }]}>{item.name}</Text>
                  <Text style={[styles.contactPhone, { color: themeSubTextColor }]}>{item.phone}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  topHeaderBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 6,
  },
  scrollView: {
    flex: 1,
  },
  headingSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  headingTitle: {
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 6,
  },
  subSentenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  subSentenceText: {
    fontSize: 13,
    fontWeight: '600',
  },
  searchRowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sharpSearchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: 4, // Sharp edge corners as requested!
    borderWidth: 1,
    paddingHorizontal: 12,
    marginRight: 12,
  },
  inputWrapper70: {
    flex: 0.7,
    height: 44,
    justifyContent: 'center',
    position: 'relative',
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    zIndex: 2,
  },
  animatedPlaceholderBox: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    overflow: 'hidden',
    zIndex: 1,
  },
  placeholderText: {
    fontSize: 13,
    fontWeight: '500',
  },
  verticalDividerLine: {
    width: 1,
    height: 22,
    marginHorizontal: 8,
  },
  right30Box: {
    flex: 0.3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  blueNumberBadge: {
    color: '#0b57d0',
    fontSize: 14,
    fontWeight: '800',
  },
  contactsIconButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  bigSectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 16,
  },
  recentsList: {
    marginBottom: 8,
  },
  recentItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  contactAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarLetterText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  contactDetailsCol: {
    flex: 1,
  },
  contactName: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  contactPhone: {
    fontSize: 13,
    fontWeight: '500',
  },
  specialActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  specialIconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  specialTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  allContactsList: {
    marginTop: 4,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
});
