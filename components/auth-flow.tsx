import { getApiBaseUrl } from '@/constants/config';
import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  FlatList,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  useColorScheme,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

interface AuthFlowProps {
  onAuthSuccess: () => void;
}

const COUNTRIES = [
  { name: 'India', code: '+91', flag: '🇮🇳' },
  { name: 'United States', code: '+1', flag: '🇺🇸' },
  { name: 'United Kingdom', code: '+44', flag: '🇬🇧' },
  { name: 'United Arab Emirates', code: '+971', flag: '🇦🇪' },
  { name: 'Australia', code: '+61', flag: '🇦🇺' },
  { name: 'Singapore', code: '+65', flag: '🇸🇬' },
  { name: 'Canada', code: '+1', flag: '🇨🇦' },
];

export default function AuthFlow({ onAuthSuccess }: AuthFlowProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [step, setStep] = useState<'PHONE' | 'OTP'>('PHONE');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);
  const [countryPickerVisible, setCountryPickerVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [mockOtp, setMockOtp] = useState<string | null>(null);

  // OTP State: 6-digit code
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const otpInputs = useRef<Array<TextInput | null>>([]);

  const fullPhoneNumber = `${selectedCountry.code}${phoneNumber}`;

  // Handle Send OTP request
  const handleSendOtp = async () => {
    if (!phoneNumber || phoneNumber.length < 7) {
      Alert.alert('Invalid Number', 'Please enter a valid mobile number.');
      return;
    }

    setLoading(true);
    try {
      const baseUrl = getApiBaseUrl();
      const response = await fetch(`${baseUrl}/api/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: fullPhoneNumber }),
      });

      const data = await response.json();
      setLoading(false);

      if (data.success) {
        setStep('OTP');
        if (data.mode === 'mock' && data.otp) {
          setMockOtp(data.otp);
          // Alert user of the mock OTP for easy testing
          Alert.alert('Verification Code (Mock Mode)', `Your verification code is: ${data.otp}`, [
            { text: 'OK' }
          ]);
        }
      } else {
        Alert.alert('Error', data.message || 'Failed to send OTP. Please try again.');
      }
    } catch (error: any) {
      setLoading(false);
      console.error('Send OTP Error:', error);
      Alert.alert(
        'Connection Error',
        `Failed to reach the backend server.\n\nMake sure the Node server is running at:\n${getApiBaseUrl()}\n\nDetail: ${error.message}`
      );
    }
  };

  // Handle Verify OTP request
  const handleVerifyOtp = async () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      Alert.alert('Invalid Code', 'Please enter the 6-digit OTP code.');
      return;
    }

    setLoading(true);
    try {
      const baseUrl = getApiBaseUrl();
      const response = await fetch(`${baseUrl}/api/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: fullPhoneNumber, otp: otpCode }),
      });

      const data = await response.json();
      setLoading(false);

      if (data.success) {
        // Save verification info to AsyncStorage
        await AsyncStorage.setItem('user_phone', fullPhoneNumber);
        await AsyncStorage.setItem('isAuthenticated', 'true');
        onAuthSuccess();
      } else {
        Alert.alert('Verification Failed', data.message || 'Invalid code. Please try again.');
      }
    } catch (error: any) {
      setLoading(false);
      console.error('Verify OTP Error:', error);
      Alert.alert('Connection Error', 'Failed to reach the backend server. Please try again.');
    }
  };

  // Handle individual OTP cell edits
  const handleOtpChange = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    // Auto-focus next cell
    if (text !== '' && index < 5) {
      otpInputs.current[index + 1]?.focus();
    }
  };

  // Handle backspace navigation in OTP grid
  const handleOtpKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && otp[index] === '' && index > 0) {
      otpInputs.current[index - 1]?.focus();
    }
  };

  // Reset OTP fields
  useEffect(() => {
    if (step === 'OTP') {
      setOtp(['', '', '', '', '', '']);
      setTimeout(() => {
        otpInputs.current[0]?.focus();
      }, 150);
    }
  }, [step]);

  // Filter country list based on search query
  const filteredCountries = COUNTRIES.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.code.includes(searchQuery)
  );

  const themeBgColor = isDark ? '#121212' : '#ffffff';
  const themeTextColor = isDark ? '#ffffff' : '#202124';
  const themeSubTextColor = isDark ? '#9aa0a6' : '#5f6368';
  const themeBorderColor = isDark ? '#3c4043' : '#dadce0';
  const themeInputBg = isDark ? '#202124' : '#f1f3f4';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeBgColor }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: themeTextColor }]}>
            {step === 'PHONE' ? 'Enter your phone number' : 'Enter the 6-digit code'}
          </Text>
          <Text style={[styles.subtitle, { color: themeSubTextColor }]}>
            {step === 'PHONE'
              ? 'To find your bank accounts and cards, enter your mobile number linked to your bank.'
              : `We sent a text message verification code to ${fullPhoneNumber}`}
          </Text>
        </View>

        <View style={styles.content}>
          {step === 'PHONE' ? (
            <View style={styles.phoneInputRow}>
              {/* Country Picker Button */}
              <TouchableOpacity
                style={[styles.countryPickerButton, { borderColor: themeBorderColor }]}
                onPress={() => setCountryPickerVisible(true)}
              >
                <Text style={styles.flagText}>{selectedCountry.flag}</Text>
                <Text style={[styles.countryCode, { color: themeTextColor }]}>
                  {selectedCountry.code}
                </Text>
              </TouchableOpacity>

              {/* Mobile Number Text Field */}
              <TextInput
                style={[styles.phoneInput, { color: themeTextColor, borderBottomColor: themeBorderColor }]}
                placeholder="00000 00000"
                placeholderTextColor={themeSubTextColor}
                keyboardType="phone-pad"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                maxLength={12}
                autoFocus
              />
            </View>
          ) : (
            <View style={styles.otpWrapper}>
              {/* 6-cell digit grid input */}
              <View style={styles.otpContainer}>
                {otp.map((digit, index) => (
                  <TextInput
                    key={index}
                    ref={ref => { otpInputs.current[index] = ref; }}
                    style={[
                      styles.otpInput,
                      {
                        color: themeTextColor,
                        backgroundColor: themeInputBg,
                        borderColor: digit ? '#1a73e8' : themeBorderColor,
                      },
                    ]}
                    keyboardType="number-pad"
                    maxLength={1}
                    value={digit}
                    onChangeText={text => handleOtpChange(text, index)}
                    onKeyPress={e => handleOtpKeyPress(e, index)}
                    textAlign="center"
                  />
                ))}
              </View>

              {/* Show mock OTP on screen for developer helper */}
              {mockOtp && (
                <Text style={styles.helperText}>
                  Development Code: <Text style={styles.helperCode}>{mockOtp}</Text>
                </Text>
              )}

              {/* Go back action */}
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => {
                  setStep('PHONE');
                  setMockOtp(null);
                }}
              >
                <Text style={styles.backButtonText}>Change phone number</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Action Button Footer */}
        <View style={styles.footer}>
          {step === 'PHONE' && (
            <Text style={[styles.termsText, { color: themeSubTextColor }]}>
              By continuing, you agree to Google Pay’s Terms of Service. Carrier SMS charges may apply to verify your identity.
            </Text>
          )}

          <TouchableOpacity
            style={[styles.primaryButton, { opacity: loading ? 0.7 : 1 }]}
            onPress={step === 'PHONE' ? handleSendOtp : handleVerifyOtp}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text style={styles.primaryButtonText}>
                {step === 'PHONE' ? 'Continue' : 'Verify'}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Modal Country Picker */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={countryPickerVisible}
          onRequestClose={() => setCountryPickerVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: themeBgColor }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: themeTextColor }]}>Select Country</Text>
                <TouchableOpacity onPress={() => setCountryPickerVisible(false)}>
                  <Text style={styles.closeText}>Close</Text>
                </TouchableOpacity>
              </View>

              <TextInput
                style={[styles.searchInput, { color: themeTextColor, backgroundColor: themeInputBg }]}
                placeholder="Search country or code..."
                placeholderTextColor={themeSubTextColor}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />

              <FlatList
                data={filteredCountries}
                keyExtractor={item => item.code + item.name}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[styles.countryItem, { borderBottomColor: themeBorderColor }]}
                    onPress={() => {
                      setSelectedCountry(item);
                      setCountryPickerVisible(false);
                      setSearchQuery('');
                    }}
                  >
                    <Text style={styles.flagText}>{item.flag}</Text>
                    <Text style={[styles.countryItemName, { color: themeTextColor }]}>{item.name}</Text>
                    <Text style={[styles.countryItemCode, { color: themeSubTextColor }]}>{item.code}</Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 99998,
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
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  phoneInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
  },
  countryPickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 12,
  },
  flagText: {
    fontSize: 20,
    marginRight: 8,
  },
  countryCode: {
    fontSize: 16,
    fontWeight: '600',
  },
  phoneInput: {
    flex: 1,
    fontSize: 20,
    borderBottomWidth: 1.5,
    paddingVertical: 8,
    fontWeight: '500',
  },
  otpWrapper: {
    alignItems: 'center',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: 320,
    marginBottom: 24,
  },
  otpInput: {
    width: 45,
    height: 50,
    borderWidth: 1.5,
    borderRadius: 8,
    fontSize: 20,
    fontWeight: 'bold',
  },
  helperText: {
    fontSize: 14,
    color: '#1a73e8',
    marginBottom: 24,
  },
  helperCode: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: '#1a73e8',
    fontWeight: '600',
    fontSize: 14,
  },
  footer: {
    marginBottom: Platform.OS === 'ios' ? 30 : 20,
  },
  termsText: {
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    marginBottom: 16,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeText: {
    color: '#1a73e8',
    fontSize: 16,
    fontWeight: '600',
  },
  searchInput: {
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 16,
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 0.5,
  },
  countryItemName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  countryItemCode: {
    fontSize: 16,
    fontWeight: '600',
  },
});
