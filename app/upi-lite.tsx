import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  useColorScheme,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons, FontAwesome6 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function UpiLiteScreen() {
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
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* HERO ICON */}
        <View style={styles.heroIconCircle}>
          <Ionicons name="flash-sharp" size={44} color="#0b57d0" />
        </View>

        <Text style={[styles.titleText, { color: themeTextColor }]}>UPI Lite: Pay PIN-free</Text>
        <Text style={[styles.subtitleText, { color: themeSubTextColor }]}>
          Instant payments up to ₹500 without entering your 6-digit UPI PIN
        </Text>

        {/* FEATURES CARDS */}
        <View style={styles.featuresList}>
          {/* Feature 1 */}
          <View style={[styles.featureItemRow, { backgroundColor: themeCardBg }]}>
            <View style={styles.featureIconBox}>
              <Ionicons name="rocket-outline" size={24} color="#0b57d0" />
            </View>
            <View style={styles.featureTextCol}>
              <Text style={[styles.featureTitle, { color: themeTextColor }]}>Superfast Transactions</Text>
              <Text style={[styles.featureDesc, { color: themeSubTextColor }]}>
                100% payment success rate with instant processing
              </Text>
            </View>
          </View>

          {/* Feature 2 */}
          <View style={[styles.featureItemRow, { backgroundColor: themeCardBg }]}>
            <View style={styles.featureIconBox}>
              <Ionicons name="key-outline" size={24} color="#0b57d0" />
            </View>
            <View style={styles.featureTextCol}>
              <Text style={[styles.featureTitle, { color: themeTextColor }]}>No UPI PIN Required</Text>
              <Text style={[styles.featureDesc, { color: themeSubTextColor }]}>
                Pay amounts up to ₹500 with a single tap
              </Text>
            </View>
          </View>

          {/* Feature 3 */}
          <View style={[styles.featureItemRow, { backgroundColor: themeCardBg }]}>
            <View style={styles.featureIconBox}>
              <MaterialIcons name="security" size={24} color="#0b57d0" />
            </View>
            <View style={styles.featureTextCol}>
              <Text style={[styles.featureTitle, { color: themeTextColor }]}>Bank Server Independent</Text>
              <Text style={[styles.featureDesc, { color: themeSubTextColor }]}>
                Works smoothly even during bank downtime
              </Text>
            </View>
          </View>
        </View>

        {/* ACTIVATE BUTTON */}
        <TouchableOpacity 
          style={styles.activateBtn}
          onPress={() => Alert.alert('UPI Lite Activated', 'UPI Lite is now active on your default bank account!')}
        >
          <Text style={styles.activateBtnText}>Activate UPI Lite</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  topNavRow: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  navIconButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 40,
    alignItems: 'center',
  },
  heroIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e8f0fe',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  titleText: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitleText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
  },
  featuresList: {
    width: '100%',
    marginBottom: 36,
  },
  featureItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  featureIconBox: {
    marginRight: 16,
  },
  featureTextCol: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  featureDesc: {
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
  },
  activateBtn: {
    width: '100%',
    backgroundColor: '#0b57d0',
    paddingVertical: 16,
    borderRadius: 24,
    alignItems: 'center',
  },
  activateBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
});
