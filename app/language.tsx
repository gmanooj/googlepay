import React, { useState } from 'react';
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
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface LanguageOption {
  id: string;
  name: string;
}

const LANGUAGES: LanguageOption[] = [
  { id: 'en', name: 'English' },
  { id: 'hi', name: 'हिन्दी (Hindi)' },
  { id: 'hinglish', name: 'हिंग्लिश (Hinglish)' },
  { id: 'bn', name: 'বাংলা (Bengali)' },
  { id: 'gu', name: 'ગુજરાતી (Gujarati)' },
  { id: 'kn', name: 'கன்னட (Kannada)' },
  { id: 'ml', name: 'மலையாளம் (Malayalam)' },
  { id: 'mr', name: 'मराठी (Marathi)' },
  { id: 'ta', name: 'தமிழ் (Tamil)' },
  { id: 'te', name: 'తెలుగు (Telugu)' },
];

export default function LanguageScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [selectedLang, setSelectedLang] = useState('en');

  const themeBgColor = isDark ? '#121212' : '#ffffff';
  const themeTextColor = isDark ? '#ffffff' : '#202124';
  const themeSubTextColor = isDark ? '#9aa0a6' : '#5f6368';

  const handleDone = () => {
    const lang = LANGUAGES.find(l => l.id === selectedLang)?.name || 'English';
    Alert.alert('Language Updated', `App language set to ${lang}`);
    router.back();
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: themeBgColor }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* TOP HEADER */}
      <View style={styles.topHeaderRow}>
        <TouchableOpacity style={styles.navIconButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={themeTextColor} />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: themeTextColor }]}>Select language</Text>

        <TouchableOpacity style={styles.navIconButton} onPress={() => Alert.alert('Menu', 'Language help')}>
          <Ionicons name="ellipsis-vertical" size={22} color={themeTextColor} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.languagesList}>
          {LANGUAGES.map(item => {
            const isSelected = item.id === selectedLang;
            return (
              <TouchableOpacity 
                key={item.id}
                style={styles.langRow}
                onPress={() => setSelectedLang(item.id)}
              >
                <Text style={[styles.langName, { color: themeTextColor, fontWeight: isSelected ? '700' : '500' }]}>
                  {item.name}
                </Text>

                {isSelected ? (
                  <Ionicons name="checkmark-circle" size={24} color="#0b57d0" />
                ) : (
                  <View style={[styles.radioCircle, { borderColor: themeSubTextColor }]} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* BOTTOM DONE BUTTON */}
      <View style={[styles.bottomButtonContainer, { backgroundColor: themeBgColor }]}>
        <TouchableOpacity style={styles.doneBtn} onPress={handleDone}>
          <Text style={styles.doneBtnText}>Done</Text>
        </TouchableOpacity>
      </View>
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
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    flex: 1,
    marginLeft: 12,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
  },
  languagesList: {
    width: '100%',
  },
  langRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 18,
  },
  langName: {
    fontSize: 16,
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
  },
  bottomButtonContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  doneBtn: {
    backgroundColor: '#0b57d0',
    paddingVertical: 16,
    borderRadius: 24,
    alignItems: 'center',
  },
  doneBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
});
