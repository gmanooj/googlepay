import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  useColorScheme,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

interface ProfileFormProps {
  onSaveSuccess: () => void;
}

export default function ProfileForm({ onSaveSuccess }: ProfileFormProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [dob, setDob] = useState('');
  const [loading, setLoading] = useState(false);

  // Retrieve logged-in user phone number from AsyncStorage
  useEffect(() => {
    async function loadPhone() {
      try {
        const storedPhone = await AsyncStorage.getItem('user_phone');
        if (storedPhone) {
          setPhone(storedPhone);
        }
      } catch (error) {
        console.error('Failed to load user phone number:', error);
      }
    }
    loadPhone();
  }, []);

  const getApiBaseUrl = () => {
    const hostUri = Constants.expoConfig?.hostUri;
    if (hostUri) {
      const ip = hostUri.split(':')[0];
      return `http://${ip}:5000`;
    }
    return 'http://localhost:5000';
  };

  const handleSaveProfile = async () => {
    if (!name.trim()) {
      Alert.alert('Required Field', 'Please enter your full name.');
      return;
    }

    if (!age.trim() || isNaN(Number(age)) || Number(age) <= 0) {
      Alert.alert('Invalid Field', 'Please enter a valid age.');
      return;
    }

    if (!dob.trim()) {
      Alert.alert('Required Field', 'Please enter your date of birth.');
      return;
    }

    setLoading(true);
    try {
      const baseUrl = getApiBaseUrl();
      const response = await fetch(`${baseUrl}/api/update-profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone,
          name: name.trim(),
          age: Number(age),
          dob: dob.trim(),
        }),
      });

      const data = await response.json();
      setLoading(false);

      if (data.success) {
        // Save profile completion status locally
        await AsyncStorage.setItem('isProfileComplete', 'true');
        await AsyncStorage.setItem('user_name', name.trim());
        onSaveSuccess();
      } else {
        Alert.alert('Error', data.message || 'Failed to update profile. Please try again.');
      }
    } catch (error: any) {
      setLoading(false);
      console.error('Save Profile Error:', error);
      Alert.alert('Connection Error', 'Failed to reach the backend server. Please try again.');
    }
  };

  const themeBgColor = isDark ? '#121212' : '#ffffff';
  const themeTextColor = isDark ? '#ffffff' : '#202124';
  const themeSubTextColor = isDark ? '#9aa0a6' : '#5f6368';
  const themeBorderColor = isDark ? '#3c4043' : '#dadce0';
  const themeDisabledBg = isDark ? '#202124' : '#f1f3f4';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeBgColor }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: themeTextColor }]}>Create your profile</Text>
          <Text style={[styles.subtitle, { color: themeSubTextColor }]}>
            Enter your details to register as a Google Pay UPI user.
          </Text>
        </View>

        <View style={styles.form}>
          {/* Mobile Number Field (Disabled) */}
          <View style={styles.inputWrapper}>
            <Text style={[styles.inputLabel, { color: themeSubTextColor }]}>Mobile Number</Text>
            <TextInput
              style={[
                styles.textInput,
                {
                  color: themeSubTextColor,
                  backgroundColor: themeDisabledBg,
                  borderColor: themeBorderColor,
                },
              ]}
              value={phone}
              editable={false}
              selectTextOnFocus={false}
            />
          </View>

          {/* Full Name Field */}
          <View style={styles.inputWrapper}>
            <Text style={[styles.inputLabel, { color: themeTextColor }]}>Full Name</Text>
            <TextInput
              style={[
                styles.textInput,
                { color: themeTextColor, borderColor: themeBorderColor },
              ]}
              placeholder="Enter your full name"
              placeholderTextColor={themeSubTextColor}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.row}>
            {/* Age Field */}
            <View style={[styles.inputWrapper, { flex: 1, marginRight: 12 }]}>
              <Text style={[styles.inputLabel, { color: themeTextColor }]}>Age</Text>
              <TextInput
                style={[
                  styles.textInput,
                  { color: themeTextColor, borderColor: themeBorderColor },
                ]}
                placeholder="Age"
                placeholderTextColor={themeSubTextColor}
                keyboardType="numeric"
                maxLength={3}
                value={age}
                onChangeText={setAge}
              />
            </View>

            {/* Date of Birth Field */}
            <View style={[styles.inputWrapper, { flex: 2 }]}>
              <Text style={[styles.inputLabel, { color: themeTextColor }]}>Date of Birth (DoB)</Text>
              <TextInput
                style={[
                  styles.textInput,
                  { color: themeTextColor, borderColor: themeBorderColor },
                ]}
                placeholder="DD/MM/YYYY"
                placeholderTextColor={themeSubTextColor}
                value={dob}
                onChangeText={setDob}
              />
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.primaryButton, { opacity: loading ? 0.7 : 1 }]}
            onPress={handleSaveProfile}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text style={styles.primaryButtonText}>Save & Continue</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 99997,
  },
  keyboardView: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
  },
  header: {
    marginTop: Platform.OS === 'ios' ? 40 : 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  form: {
    flex: 1,
    justifyContent: 'center',
    marginBottom: 30,
  },
  inputWrapper: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1.5,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    fontWeight: '500',
  },
  row: {
    flexDirection: 'row',
  },
  footer: {
    marginBottom: Platform.OS === 'ios' ? 30 : 20,
  },
  primaryButton: {
    backgroundColor: '#1a73e8',
    paddingVertical: 16,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
