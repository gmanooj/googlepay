import React from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons, FontAwesome6 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function RewardsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const themeBgColor = isDark ? '#121212' : '#ffffff';
  const themeTextColor = isDark ? '#ffffff' : '#202124';
  const themeSubTextColor = isDark ? '#9aa0a6' : '#5f6368';
  const themeCardBg = isDark ? '#202124' : '#f8fafd';

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: isDark ? '#121212' : '#fef3c7' }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* NAV BAR */}
      <View style={styles.topNavRow}>
        <TouchableOpacity style={styles.navIconButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={themeTextColor} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navIconButton} onPress={() => Alert.alert('Options', 'Rewards settings')}>
          <Ionicons name="ellipsis-vertical" size={22} color={themeTextColor} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* HERO REWARDS HEADER - SOFT YELLOW GRADIENT */}
        <View style={styles.rewardsHeroSection}>
          <View style={styles.rewardsHeroLeft}>
            <Text style={[styles.rewardsTotalAmount, { color: themeTextColor }]}>₹28</Text>
            <Text style={[styles.rewardsTotalLabel, { color: themeSubTextColor }]}>Total rewards</Text>
          </View>

          {/* TREASURE CHEST / REWARDS ILLUSTRATION */}
          <View style={styles.rewardsHeroRight}>
            <Image 
              source={require('@/assets/images/scratch_card.png')} 
              style={styles.treasureImage} 
              resizeMode="contain" 
            />
          </View>
        </View>

        {/* MAIN REWARDS SHEET */}
        <View style={[styles.sheetContainer, { backgroundColor: themeBgColor }]}>
          
          {/* SPONSORED CARD (LENSKART VC AIR EYEGLASSES) */}
          <View style={[styles.sponsoredCard, { backgroundColor: isDark ? '#202124' : '#f0f9ff' }]}>
            <View style={styles.sponsoredLeft}>
              <View style={styles.sponsoredBadgeRow}>
                <Text style={styles.sponsoredTag}>Sponsored</Text>
                <Ionicons name="ellipsis-vertical" size={14} color="#5f6368" />
              </View>
              <View style={styles.brandRow}>
                <Text style={[styles.brandName, { color: themeTextColor }]}>Lenskart</Text>
              </View>
              <Text style={[styles.adTitle, { color: themeTextColor }]}>Lenskart VC Air Eyeglasses</Text>
              <TouchableOpacity onPress={() => Alert.alert('Lenskart', 'Opening Lenskart website...')}>
                <Text style={styles.visitSiteLink}>Visit site</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.sponsoredRight}>
              <Image 
                source={{ uri: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=300&q=80' }} 
                style={styles.adImage} 
                resizeMode="contain" 
              />
            </View>
          </View>

          {/* "YOUR REWARDS" SECTION */}
          <View style={styles.yourRewardsSection}>
            <Text style={[styles.sectionHeading, { color: themeTextColor }]}>Your rewards</Text>

            <View style={styles.rewardsGrid}>
              {/* Card 1: Gold Scratch Card (7d left) */}
              <TouchableOpacity 
                style={[styles.rewardGridCard, { backgroundColor: '#f97316' }]}
                onPress={() => Alert.alert('Scratch Card', 'Scratch to reveal your cashback!')}
              >
                <View style={styles.badgeTopRight}>
                  <Text style={styles.badgeText}>7d left</Text>
                </View>
                <Ionicons name="gift" size={48} color="#ffffff" style={{ marginTop: 24 }} />
              </TouchableOpacity>

              {/* Card 2: GoodFlip Flat ₹400 Off */}
              <TouchableOpacity 
                style={[styles.rewardGridCard, { backgroundColor: themeCardBg, borderWidth: 1, borderColor: '#dadce0' }]}
                onPress={() => Alert.alert('GoodFlip Offer', 'Flat ₹400 Off on Smart Scale')}
              >
                <Image 
                  source={{ uri: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&q=80' }} 
                  style={styles.cardImageTop} 
                  resizeMode="cover" 
                />
                <View style={styles.cardContentBottom}>
                  <Text style={[styles.cardOfferTitle, { color: themeTextColor }]}>Flat ₹400 Off</Text>
                  <Text style={[styles.cardOfferDesc, { color: themeSubTextColor }]} numberOfLines={2}>
                    GoodFlip Premium Smart Scale | Shop Now
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Card 3: ₹5 - ₹100 Cashback at Myntra (11d left) */}
              <TouchableOpacity 
                style={[styles.rewardGridCard, { backgroundColor: '#e0f2fe' }]}
                onPress={() => Alert.alert('Myntra Cashback', '₹5 - ₹100 Cashback on Myntra order')}
              >
                <View style={styles.badgeTopRight}>
                  <Text style={styles.badgeTextDark}>11d left</Text>
                </View>
                <View style={styles.brandIconCircle}>
                  <Ionicons name="logo-google" size={18} color="#ea4335" />
                </View>
                <Ionicons name="gift-outline" size={40} color="#0284c7" style={{ marginTop: 10 }} />
                <View style={styles.cardContentBottom}>
                  <Text style={[styles.cardOfferTitle, { color: themeTextColor }]}>₹5 - ₹100</Text>
                  <Text style={[styles.cardOfferDesc, { color: themeSubTextColor }]}>Cashback at Myntra</Text>
                </View>
              </TouchableOpacity>

              {/* Card 4: ₹5 - ₹100 Cashback at Meesho (11d left) */}
              <TouchableOpacity 
                style={[styles.rewardGridCard, { backgroundColor: '#e0f2fe' }]}
                onPress={() => Alert.alert('Meesho Cashback', '₹5 - ₹100 Cashback on Meesho order')}
              >
                <View style={styles.badgeTopRight}>
                  <Text style={styles.badgeTextDark}>11d left</Text>
                </View>
                <View style={styles.brandIconCircle}>
                  <Ionicons name="logo-google" size={18} color="#ea4335" />
                </View>
                <Ionicons name="gift-outline" size={40} color="#0284c7" style={{ marginTop: 10 }} />
                <View style={styles.cardContentBottom}>
                  <Text style={[styles.cardOfferTitle, { color: themeTextColor }]}>₹5 - ₹100</Text>
                  <Text style={[styles.cardOfferDesc, { color: themeSubTextColor }]}>Cashback at Meesho</Text>
                </View>
              </TouchableOpacity>
            </View>
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
  rewardsHeroSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 24,
  },
  rewardsHeroLeft: {
    flex: 1,
  },
  rewardsTotalAmount: {
    fontSize: 36,
    fontWeight: '800',
    marginBottom: 4,
  },
  rewardsTotalLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  rewardsHeroRight: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  treasureImage: {
    width: 100,
    height: 90,
  },
  sheetContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    minHeight: 600,
  },
  sponsoredCard: {
    flexDirection: 'row',
    borderRadius: 20,
    padding: 16,
    marginBottom: 24,
    alignItems: 'center',
  },
  sponsoredLeft: {
    flex: 1,
    paddingRight: 12,
  },
  sponsoredBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  sponsoredTag: {
    fontSize: 11,
    fontWeight: '600',
    color: '#5f6368',
  },
  brandRow: {
    marginBottom: 4,
  },
  brandName: {
    fontSize: 13,
    fontWeight: '700',
  },
  adTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 10,
  },
  visitSiteLink: {
    color: '#0b57d0',
    fontSize: 14,
    fontWeight: '800',
  },
  sponsoredRight: {
    width: 90,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  adImage: {
    width: '100%',
    height: '100%',
  },
  yourRewardsSection: {
    marginBottom: 20,
  },
  sectionHeading: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 16,
  },
  rewardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  rewardGridCard: {
    width: '48%',
    height: 180,
    borderRadius: 20,
    padding: 12,
    marginBottom: 16,
    position: 'relative',
    overflow: 'hidden',
    justifyContent: 'space-between',
  },
  badgeTopRight: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255,255,255,0.85)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    zIndex: 2,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#202124',
  },
  badgeTextDark: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0369a1',
  },
  brandIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardImageTop: {
    width: '100%',
    height: 90,
    borderRadius: 12,
  },
  cardContentBottom: {
    marginTop: 4,
  },
  cardOfferTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 2,
  },
  cardOfferDesc: {
    fontSize: 11,
    fontWeight: '600',
  },
});
