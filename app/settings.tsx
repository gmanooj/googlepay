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

export default function SettingsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const themeBgColor = isDark ? '#121212' : '#ffffff';
  const themeTextColor = isDark ? '#ffffff' : '#202124';
  const themeSubTextColor = isDark ? '#9aa0a6' : '#5f6368';
  const themeBorderColor = isDark ? '#3c4043' : '#dadce0';

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: themeBgColor }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* TOP HEADER */}
      <View style={styles.topHeaderRow}>
        <TouchableOpacity style={styles.navIconButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={themeTextColor} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navIconButton} onPress={() => Alert.alert('Menu', 'Settings help')}>
          <Ionicons name="ellipsis-vertical" size={22} color={themeTextColor} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={[styles.mainTitle, { color: themeTextColor }]}>Settings</Text>

        <View style={styles.settingsList}>
          {/* Item 1: Your info */}
          <TouchableOpacity 
            style={styles.settingItemRow}
            onPress={() => Alert.alert('Your Info', 'Name: G Manooj\nPhone: 6380866053')}
          >
            <Ionicons name="person-circle-outline" size={24} color="#0b57d0" style={styles.settingIcon} />
            <Text style={[styles.settingLabel, { color: themeTextColor }]}>Your info</Text>
          </TouchableOpacity>

          {/* Item 2: Notifications & emails */}
          <TouchableOpacity 
            style={styles.settingItemRow}
            onPress={() => Alert.alert('Notifications & Emails', 'Manage notification preferences.')}
          >
            <Ionicons name="notifications-outline" size={24} color="#0b57d0" style={styles.settingIcon} />
            <Text style={[styles.settingLabel, { color: themeTextColor }]}>Notifications & emails</Text>
          </TouchableOpacity>

          {/* Item 3: Privacy & security */}
          <TouchableOpacity 
            style={styles.settingItemRow}
            onPress={() => Alert.alert('Privacy & Security', 'Manage security, blocked people & permissions.')}
          >
            <Ionicons name="shield-checkmark-outline" size={24} color="#0b57d0" style={styles.settingIcon} />
            <Text style={[styles.settingLabel, { color: themeTextColor }]}>Privacy & security</Text>
          </TouchableOpacity>

          {/* DIVIDER LINE */}
          <View style={[styles.dividerLine, { backgroundColor: themeBorderColor }]} />

          {/* Item 4: Language */}
          <TouchableOpacity 
            style={styles.settingItemRow}
            onPress={() => router.push('/language')}
          >
            <Ionicons name="language-outline" size={24} color="#0b57d0" style={styles.settingIcon} />
            <Text style={[styles.settingLabel, { color: themeTextColor }]}>Language</Text>
          </TouchableOpacity>

          {/* Item 5: About */}
          <TouchableOpacity 
            style={styles.settingItemRow}
            onPress={() => Alert.alert('About Google Pay', 'Google Pay v3.104.2\nBuild 2026')}
          >
            <Ionicons name="information-circle-outline" size={24} color="#0b57d0" style={styles.settingIcon} />
            <Text style={[styles.settingLabel, { color: themeTextColor }]}>About</Text>
          </TouchableOpacity>

          {/* Item 6: Help & feedback */}
          <TouchableOpacity 
            style={styles.settingItemRow}
            onPress={() => Alert.alert('Help & Feedback', 'Google Pay 24/7 Customer Care')}
          >
            <Ionicons name="help-circle-outline" size={24} color="#0b57d0" style={styles.settingIcon} />
            <Text style={[styles.settingLabel, { color: themeTextColor }]}>Help & feedback</Text>
          </TouchableOpacity>

          {/* Item 7: Lock app */}
          <TouchableOpacity 
            style={styles.settingItemRow}
            onPress={() => Alert.alert('Lock App', 'Screen lock enabled for Google Pay.')}
          >
            <Ionicons name="lock-closed-outline" size={24} color="#0b57d0" style={styles.settingIcon} />
            <Text style={[styles.settingLabel, { color: themeTextColor }]}>Lock app</Text>
          </TouchableOpacity>

          {/* Item 8: Sign out */}
          <TouchableOpacity 
            style={styles.settingItemRow}
            onPress={() => Alert.alert('Sign Out', 'Are you sure you want to sign out of Google Pay?', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Sign Out', style: 'destructive', onPress: () => router.replace('/(tabs)') }
            ])}
          >
            <Ionicons name="power-outline" size={24} color="#0b57d0" style={styles.settingIcon} />
            <Text style={[styles.settingLabel, { color: themeTextColor }]}>Sign out</Text>
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
  topHeaderRow: {
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
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 40,
  },
  mainTitle: {
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 24,
  },
  settingsList: {
    width: '100%',
  },
  settingItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  settingIcon: {
    marginRight: 20,
    width: 24,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  dividerLine: {
    height: 1,
    marginVertical: 12,
  },
});
