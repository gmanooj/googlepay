import React, { useState } from 'react';
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
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons, FontAwesome6 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const MOCK_FRIENDS = [
  { id: 'f1', name: 'Aarav Sharma', phone: '+91 98765 43210', letter: 'A', color: '#1a73e8' },
  { id: 'f2', name: 'Aditi Patel', phone: '+91 87654 32109', letter: 'A', color: '#ea4335' },
  { id: 'f3', name: 'Bhavana Rao', phone: '+91 76543 21098', letter: 'B', color: '#f9ab00' },
  { id: 'f4', name: 'Chaitanya Reddy', phone: '+91 65432 10987', letter: 'C', color: '#34a853' },
  { id: 'f5', name: 'Divya Nair', phone: '+91 91234 56789', letter: 'D', color: '#a142f4' },
];

export default function ReferralsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [searchQuery, setSearchQuery] = useState('');

  const themeBgColor = isDark ? '#121212' : '#ffffff';
  const themeTextColor = isDark ? '#ffffff' : '#202124';
  const themeSubTextColor = isDark ? '#9aa0a6' : '#5f6368';

  const filteredFriends = MOCK_FRIENDS.filter(f =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.phone.includes(searchQuery)
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: isDark ? '#121212' : '#e0f2fe' }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* TOP NAV BAR */}
      <View style={styles.topNavRow}>
        <TouchableOpacity style={styles.navIconButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={themeTextColor} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navIconButton} onPress={() => Alert.alert('Menu', 'Referral terms')}>
          <Ionicons name="ellipsis-vertical" size={22} color={themeTextColor} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* HERO BANNER SECTION */}
        <View style={styles.heroSection}>
          <View style={styles.heroLeft}>
            <Text style={[styles.heroTitle, { color: themeTextColor }]}>Refer friends & earn cashback</Text>
            <TouchableOpacity 
              style={styles.referNowBtn}
              onPress={() => Alert.alert('Referral Code', 'Your referral code: GPAY8821. Link copied!')}
            >
              <Text style={styles.referNowText}>Refer now</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.heroRightGraphic}>
            <Ionicons name="paper-plane" size={54} color="#f59e0b" />
          </View>
        </View>

        {/* MAIN CONTENT SHEET */}
        <View style={[styles.sheetContainer, { backgroundColor: themeBgColor }]}>
          
          {/* SECTION 1: HOW TO EARN */}
          <Text style={[styles.sectionHeading, { color: themeTextColor }]}>How to earn</Text>

          <View style={styles.twoCardRow}>
            {/* Card 1: Invite new friends (Earn ₹121) */}
            <View style={[styles.earnCard, { backgroundColor: '#e8f0fe' }]}>
              <View style={styles.coinBadge}>
                <Ionicons name="disc-sharp" size={14} color="#f59e0b" style={{ marginRight: 4 }} />
                <Text style={styles.coinBadgeText}>Earn ₹121</Text>
              </View>

              <View style={styles.cardGraphicBox}>
                <Ionicons name="mail" size={48} color="#0b57d0" />
              </View>

              <Text style={[styles.cardTitleText, { color: themeTextColor }]}>Invite new friends</Text>
            </View>

            {/* Card 2: Welcome friends back (Earn ₹21) */}
            <View style={[styles.earnCard, { backgroundColor: '#f3e8ff' }]}>
              <View style={styles.coinBadge}>
                <Ionicons name="disc-sharp" size={14} color="#f59e0b" style={{ marginRight: 4 }} />
                <Text style={styles.coinBadgeText}>Earn ₹21</Text>
              </View>

              <View style={styles.cardGraphicBox}>
                <Ionicons name="gift" size={48} color="#9333ea" />
              </View>

              <Text style={[styles.cardTitleText, { color: themeTextColor }]}>Welcome friends back</Text>
            </View>
          </View>

          {/* SECTION 2: LEARN MORE */}
          <Text style={[styles.sectionHeading, { color: themeTextColor, marginTop: 24 }]}>Learn more</Text>

          <View style={styles.twoCardRow}>
            {/* Card 1: Full rules */}
            <TouchableOpacity 
              style={[styles.learnCard, { backgroundColor: '#e0f2fe' }]}
              onPress={() => Alert.alert('Full Rules', 'Complete referral program terms & conditions.')}
            >
              <View style={styles.learnGraphicBox}>
                <MaterialIcons name="assignment" size={44} color="#0284c7" />
              </View>
              <Text style={[styles.cardTitleText, { color: themeTextColor }]}>Full rules</Text>
            </TouchableOpacity>

            {/* Card 2: FAQ */}
            <TouchableOpacity 
              style={[styles.learnCard, { backgroundColor: '#e0f2fe' }]}
              onPress={() => Alert.alert('FAQ', 'Frequently asked questions regarding referral rewards.')}
            >
              <View style={styles.learnGraphicBox}>
                <Ionicons name="help-circle" size={44} color="#0284c7" />
              </View>
              <Text style={[styles.cardTitleText, { color: themeTextColor }]}>FAQ</Text>
            </TouchableOpacity>
          </View>

          {/* SECTION 3: REFER FRIENDS LIST */}
          <View style={styles.referFriendsHeaderRow}>
            <Text style={[styles.sectionHeading, { color: themeTextColor, marginBottom: 0 }]}>Refer friends</Text>
            <TouchableOpacity onPress={() => Alert.alert('Search', 'Search contacts')}>
              <Ionicons name="search" size={20} color={themeSubTextColor} />
            </TouchableOpacity>
          </View>

          <View style={styles.friendsList}>
            {filteredFriends.map(friend => (
              <View key={friend.id} style={styles.friendRow}>
                <View style={[styles.avatarCircle, { backgroundColor: friend.color }]}>
                  <Text style={styles.avatarText}>{friend.letter}</Text>
                </View>
                <View style={styles.friendInfoCol}>
                  <Text style={[styles.friendName, { color: themeTextColor }]}>{friend.name}</Text>
                  <Text style={[styles.friendPhone, { color: themeSubTextColor }]}>{friend.phone}</Text>
                </View>
                <TouchableOpacity 
                  style={styles.invitePillBtn}
                  onPress={() => Alert.alert('Invite Sent', `Sent Google Pay referral invite to ${friend.name}`)}
                >
                  <Text style={styles.invitePillText}>Invite</Text>
                </TouchableOpacity>
              </View>
            ))}
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
  scrollView: {
    flex: 1,
  },
  heroSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 24,
  },
  heroLeft: {
    flex: 1,
    paddingRight: 12,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 16,
    lineHeight: 28,
  },
  referNowBtn: {
    backgroundColor: '#dbeafe',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  referNowText: {
    color: '#1d4ed8',
    fontSize: 14,
    fontWeight: '800',
  },
  heroRightGraphic: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sheetContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
    minHeight: 600,
  },
  sectionHeading: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 16,
  },
  twoCardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  earnCard: {
    width: '48%',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 170,
  },
  coinBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    alignSelf: 'center',
  },
  coinBadgeText: {
    color: '#202124',
    fontSize: 12,
    fontWeight: '800',
  },
  cardGraphicBox: {
    marginVertical: 12,
    alignItems: 'center',
  },
  cardTitleText: {
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
  },
  learnCard: {
    width: '48%',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    minHeight: 140,
    justifyContent: 'center',
  },
  learnGraphicBox: {
    marginBottom: 10,
  },
  referFriendsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 28,
    marginBottom: 16,
  },
  friendsList: {
    marginTop: 8,
  },
  friendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  friendInfoCol: {
    flex: 1,
  },
  friendName: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  friendPhone: {
    fontSize: 13,
    fontWeight: '500',
  },
  invitePillBtn: {
    borderWidth: 1,
    borderColor: '#0b57d0',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  invitePillText: {
    color: '#0b57d0',
    fontSize: 13,
    fontWeight: '800',
  },
});
