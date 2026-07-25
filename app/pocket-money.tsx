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

export default function PocketMoneyScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const themeBgColor = isDark ? '#121212' : '#ffffff';
  const themeTextColor = isDark ? '#ffffff' : '#202124';
  const themeSubTextColor = isDark ? '#9aa0a6' : '#5f6368';
  const themeCardBg = isDark ? '#202124' : '#f8fafd';

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: themeBgColor }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* TOP NAV BAR */}
      <View style={styles.topNavRow}>
        <TouchableOpacity style={styles.navIconButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={themeTextColor} />
        </TouchableOpacity>

        <View style={styles.topRightNav}>
          <TouchableOpacity style={styles.navIconButton} onPress={() => Alert.alert('Help', 'Learn how Pocket Money works')}>
            <Ionicons name="help-circle-outline" size={24} color={themeTextColor} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.navIconButton} onPress={() => Alert.alert('Menu', 'Pocket Money options')}>
            <Ionicons name="ellipsis-vertical" size={22} color={themeTextColor} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* HERO FAMILY ILLUSTRATION CARD */}
        <View style={[styles.heroCard, { backgroundColor: isDark ? '#202124' : '#edf2fa' }]}>
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=600&q=80' }} 
            style={styles.heroImage} 
            resizeMode="cover" 
          />
        </View>

        {/* HEADING & SUBTITLE */}
        <Text style={[styles.mainTitle, { color: themeTextColor }]}>Pocket money goes digital</Text>
        <Text style={[styles.mainSubTitle, { color: themeSubTextColor }]}>
          Ask your loved ones to download the Google Pay app, let them pay using your bank account
        </Text>

        {/* FEATURE CARD 1: YOU DECIDE A MONTHLY LIMIT */}
        <View style={[styles.featureCard, { backgroundColor: themeCardBg }]}>
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&q=80' }} 
            style={styles.cardIllustration} 
            resizeMode="cover" 
          />
          <Text style={[styles.featureTitle, { color: themeTextColor }]}>You decide a monthly limit</Text>
          <Text style={[styles.featureDesc, { color: themeSubTextColor }]}>
            They can use this limit to pay using UPI and you will be notified every time they pay
          </Text>
        </View>

        {/* FEATURE CARD 2: CAFE / Everyday Spending */}
        <View style={[styles.featureCard, { backgroundColor: themeCardBg }]}>
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1556742049-0a67daf4095a?w=600&q=80' }} 
            style={styles.cardIllustration} 
            resizeMode="cover" 
          />
        </View>

        {/* BOTTOM ACTION BUTTONS */}
        <View style={styles.bottomButtonsSection}>
          {/* Give pocket money button */}
          <TouchableOpacity 
            style={styles.primaryBtn}
            onPress={() => Alert.alert('Give Pocket Money', 'Select a contact to set monthly limit.')}
          >
            <Text style={styles.primaryBtnText}>Give pocket money</Text>
          </TouchableOpacity>

          {/* Receive pocket money button */}
          <TouchableOpacity 
            style={[styles.secondaryBtn, { borderColor: themeTextColor }]}
            onPress={() => Alert.alert('Receive Pocket Money', 'Request pocket money from a parent/guardian.')}
          >
            <Text style={styles.secondaryBtnText}>Receive pocket money</Text>
          </TouchableOpacity>
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
  },
  heroCard: {
    width: '100%',
    height: 180,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 20,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  mainTitle: {
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 8,
  },
  mainSubTitle: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    marginBottom: 24,
  },
  featureCard: {
    borderRadius: 24,
    padding: 16,
    marginBottom: 20,
  },
  cardIllustration: {
    width: '100%',
    height: 150,
    borderRadius: 16,
    marginBottom: 16,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 6,
  },
  featureDesc: {
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
  bottomButtonsSection: {
    marginTop: 10,
    marginBottom: 20,
  },
  primaryBtn: {
    backgroundColor: '#0b57d0',
    paddingVertical: 16,
    borderRadius: 24,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
  secondaryBtn: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#0b57d0',
    paddingVertical: 16,
    borderRadius: 24,
    alignItems: 'center',
  },
  secondaryBtnText: {
    color: '#0b57d0',
    fontSize: 15,
    fontWeight: '800',
  },
});
