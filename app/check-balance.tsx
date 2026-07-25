import { getApiBaseUrl } from '@/constants/config';
import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const API_HOST = getApiBaseUrl();

// UPI Logo SVG component
function UpiLogo() {
  return (
    <Svg viewBox="0 0 1024 466" style={{ width: 90, height: 40 }}>
      <Path fill="#3d3d3c" d="M98.1 340.7h6.3l-5.9 24.5c-.9 3.6-.7 6.4.5 8.2 1.2 1.8 3.4 2.7 6.7 2.7 3.2 0 5.9-.9 8-2.7 2.1-1.8 3.5-4.6 4.4-8.2l5.9-24.5h6.4l-6 25.1c-1.3 5.4-3.6 9.5-7 12.2-3.3 2.7-7.7 4.1-13.1 4.1-5.4 0-9.1-1.3-11.1-4s-2.4-6.8-1.1-12.2l6-25.2zm31.4 40.3 10-41.9 19 24.6c.5.7 1 1.4 1.5 2.2.5.8 1 1.7 1.6 2.7l6.7-27.9h5.9l-10 41.8-19.4-25.1-1.5-2.1c-.5-.8-.9-1.5-1.2-2.4l-6.7 28h-5.9zm44.2 0 9.6-40.3h6.4l-9.6 40.3h-6.4zm15.5 0 9.6-40.3h21.9l-1.3 5.6h-15.5l-2.4 10H217l-1.4 5.7h-15.5l-4.5 18.9h-6.4zm29 0 9.6-40.3h6.4l-9.6 40.3h-6.4zm15.5 0 9.6-40.3h21.9l-1.3 5.6h-15.5l-2.4 10.1h15.5l-1.4 5.7h-15.5l-3.1 13H257l-1.4 5.9h-21.9zm29.3 0 9.6-40.3h8.6c5.6 0 9.5.3 11.6.9 2.1.6 3.9 1.5 5.3 2.9 1.8 1.8 3 4.1 3.5 6.8.5 2.8.3 6-.5 9.5-.9 3.6-2.2 6.7-4 9.5-1.8 2.8-4.1 5-6.8 6.8-2 1.4-4.2 2.3-6.6 2.9-2.3.6-5.8.9-10.4.9H263zm7.8-6h5.4c2.9 0 5.2-.2 6.8-.6 1.6-.4 3-1.1 4.3-2 1.8-1.3 3.3-2.9 4.5-4.9 1.2-1.9 2.1-4.2 2.7-6.8.6-2.6.8-4.8.5-6.7-.3-1.9-1-3.6-2.2-4.9-.9-1-2-1.6-3.5-2-1.5-.4-3.8-.6-7.1-.6h-4.6l-6.8 28.5zm59.7-12.1-4.3 18.1h-6l9.6-40.3h9.7c2.9 0 4.9.2 6.2.5 1.3.3 2.3.8 3.1 1.6 1 .9 1.7 2.2 2 3.8.3 1.6.2 3.3-.2 5.2-.5 1.9-1.2 3.7-2.3 5.3-1.1 1.6-2.4 2.9-3.8 3.8-1.2.7-2.5 1.3-3.9 1.6-1.4.3-3.6.5-6.4.5h-3.7zm1.7-5.4h1.6c3.5 0 6-.4 7.4-1.2 1.4-.8 2.3-2.2 2.8-4.2.5-2.1.2-3.7-.8-4.5-1.1-.9-3.3-1.3-6.6-1.3H335l-2.8 11.2zm40.1 23.5-2-10.4h-15.6l-7 10.4H341l29-41.9 9 41.9h-6.7zm-13.8-15.9h10.9l-1.8-9.2c-.1-.6-.2-1.3-.2-2-.1-.8-.1-1.6-.1-2.5-.4.9-.8 1.7-1.3 2.5-.4.8-.8 1.5-1.2 2.1l-6.3 9.1zm29.7 15.9 4.4-18.4-8-21.8h6.7l5 13.7c.1.4.2.8.4 1.4.2.6.3 1.2.5 1.8l1.2-1.8c.4-.6.8-1.1 1.2-1.6l11.7-13.5h6.4L399 362.5l-4.4 18.4h-6.4zm60.9-19.9c0-.3.1-1.2.3-2.6.1-1.2.2-2.1.3-2.9-.4.9-.8 1.8-1.3 2.8-.5.9-1.1 1.9-1.8 2.8l-15.4 21.5-5-21.9c-.2-.9-.4-1.8-.5-2.6-.1-.8-.2-1.7-.2-2.5-.2.8-.5 1.7-.8 2.7-.3.9-.7 1.9-1.2 2.9l-9 19.8h-5.9l19.3-42 5.5 25.4c.1.4.2 1.1.3 2 .1.9.3 2.1.5 3.5.7-1.2 1.6-2.6 2.8-4.4.3-.5.6-.8.7-1.1l17.4-25.4-.6 42h-5.9l.5-20zm10.6 19.9 9.6-40.3h21.9l-1.3 5.6h-15.5l-2.4 10.1h15.5l-1.4 5.7h-15.5l-3.1 13H483l-1.4 5.9h-21.9zm29.2 0 10-41.9 19 24.6c.5.7 1 1.4 1.5 2.2.5.8 1 1.7 1.6 2.7l6.7-27.9h5.9l-10 41.8-19.4-25.1-1.5-2.1c-.5-.8-.9-1.5-1.2-2.4l-6.7 28h-5.9zm65.1-34.8-8.3 34.7h-6.4l8.3-34.7h-10.4l1.3-5.6h27.2l-1.3 5.6H554zm6.7 26.7 5.7-2.4c.1 1.8.6 3.2 1.7 4.1 1.1.9 2.6 1.4 4.6 1.4 1.9 0 3.5-.5 4.9-1.6 1.4-1.1 2.3-2.5 2.7-4.3.6-2.4-.8-4.5-4.2-6.3-.5-.3-.8-.5-1.1-.6-3.8-2.2-6.2-4.1-7.2-5.9-1-1.8-1.2-3.9-.6-6.4.8-3.3 2.5-5.9 5.2-8 2.7-2 5.7-3.1 9.3-3.1 2.9 0 5.2.6 6.9 1.7 1.7 1.1 2.6 2.8 2.9 4.9l-5.6 2.6c-.5-1.3-1.1-2.2-1.9-2.8-.8-.6-1.8-.9-3-.9-1.7 0-3.2.5-4.4 1.4-1.2.9-2 2.1-2.4 3.7-.6 2.4 1.1 4.7 5 6.8.3.2.5.3.7.4 3.4 1.8 5.7 3.6 6.7 5.4 1 1.8 1.2 3.9.6 6.6-.9 3.8-2.8 6.8-5.7 9.1-2.9 2.2-6.3 3.4-10.3 3.4-3.3 0-5.9-.8-7.7-2.4-2-1.6-2.9-3.9-2.8-6.8zm47.1 8.1 9.6-40.3h6.4l-9.6 40.3h-6.4zm15.6 0 10-41.9 19 24.6c.5.7 1 1.4 1.5 2.2.5.8 1 1.7 1.6 2.7l6.7-27.9h5.9l-10 41.8-19.4-25.1-1.5-2.1c-.5-.8-.9-1.5-1.2-2.4l-6.7 28h-5.9zm65.1-34.8-8.3 34.7h-6.4l8.3-34.7h-10.4l1.3-5.6h27.2l-1.3 5.6h-10.4zm6.9 34.8 9.6-40.3h22l-1.3 5.6h-15.5l-2.4 10.1h15.5l-1.4 5.7h-15.5l-3.1 13h15.5l-1.4 5.9h-22zm39.5-18.1-4.3 18h-6l9.6-40.3h8.9c2.6 0 4.6.2 5.9.5 1.4.3 2.5.9 3.3 1.7 1 1 1.6 2.2 1.9 3.8.3 1.5.2 3.2-.2 5.1-.8 3.2-2.1 5.8-4.1 7.6-2 1.8-4.5 2.9-7.5 3.3l9.1 18.3h-7.2l-8.7-18h-.7zm1.6-5.1h1.2c3.4 0 5.7-.4 7-1.2 1.3-.8 2.2-2.2 2.7-4.3.5-2.2.3-3.8-.7-4.7-1-.9-3.1-1.4-6.3-1.4h-1.2l-2.7 11.6zm18.9 23.2 9.6-40.3h21.9l-1.3 5.6h-15.5l-2.4 10h15.5l-1.4 5.7h-15.5l-4.5 18.9h-6.4zm52.8 0-2-10.4h-15.6l-7 10.4h-6.7l29-41.9 9 41.9h-6.7zm-13.9-15.9h10.9l-1.8-9.2c-.1-.6-.2-1.3-.2-2-.1-.8-.1-1.6-.1-2.5-.4.9-.8 1.7-1.3 2.5-.4.8-.8 1.5-1.2 2.1l-6.3 9.1zm62.2-14.6c-1.4-1.6-3.1-2.8-4.9-3.5-1.8-.8-3.8-1.2-6.1-1.2-4.3 0-8.1 1.4-11.5 4.2-3.4 2.8-5.6 6.5-6.7 11-1 4.3-.6 7.9 1.4 10.8 1.9 2.8 4.9 4.2 8.9 4.2 2.3 0 4.6-.4 6.9-1.3 2.3-.8 4.6-2.1 7-3.8l-1.8 7.4c-2 1.3-4.1 2.2-6.3 2.8-2.2.6-4.4.9-6.8.9-3 0-5.7-.5-8-1.5s-4.2-2.5-5.7-4.5c-1.5-1.9-2.4-4.2-2.8-6.8-.4-2.6-.3-5.4.5-8.4.7-3 1.9-5.7 3.5-8.3 1.6-2.6 3.7-4.9 6.1-6.8 2.4-2 5-3.5 7.8-4.5s5.6-1.5 8.5-1.5c2.3 0 4.4.3 6.4 1 1.9.7 3.7 1.7 5.3 3.1l-1.7 6.7zm.6 30.5 9.6-40.3h21.9l-1.3 5.6h-15.5l-2.4 10.1h15.5l-1.4 5.7H868l-3.1 13h15.5L879 381h-21.9z" />
      <Path fill="#70706e" d="M740.7 305.6h-43.9l61-220.3h43.9l-61 220.3zM717.9 92.2c-3-4.2-7.7-6.3-14.1-6.3H462.6l-11.9 43.2h219.4l-12.8 46.1H481.8v-.1h-43.9l-36.4 131.5h43.9l24.4-88.2h197.3c6.2 0 12-2.1 17.4-6.3 5.4-4.2 9-9.4 10.7-15.6l24.4-88.2c1.9-6.6 1.3-11.9-1.7-16.1zm-342 199.6c-2.4 8.7-10.4 14.8-19.4 14.8H130.2c-6.2 0-10.8-2.1-13.8-6.3-3-4.2-3.7-9.4-1.9-15.6l55.2-198.8h43.9l-49.3 177.6h175.6l49.3-177.6h43.9l-57.2 205.9z" />
      <Path fill="#098041" d="M877.5 85.7 933 196.1 816.3 306.5z" />
      <Path fill="#e97626" d="M838.5 85.7 894 196.1 777.2 306.5z" />
    </Svg>
  );
}

// Rupee Icon SVG component
function RupeeIcon() {
  return (
    <Svg width={28} height={28} fill="#1a3a6b" viewBox="0 0 24 24">
      <Path d="M18 5V3H6v2h4c1.86 0 3.41 1.28 3.86 3H6v2h7.86c-.45 1.72-2 3-3.86 3H7c-.42 0-.79.26-.94.65s-.04.83.28 1.1l8 7 1.32-1.5-6-5.25H10c2.97 0 5.43-2.17 5.91-5H18V8h-2.09a6 6 0 0 0-1.45-3z" />
    </Svg>
  );
}

export default function CheckBalanceScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const bankName = (params.bankName as string) || 'Bank Account';
  const accountNumber = (params.accountNumber as string) || '';

  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState('');
  const [balanceResult, setBalanceResult] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    async function loadPhone() {
      const stored = await AsyncStorage.getItem('user_phone');
      if (stored) setPhone(stored);
    }
    loadPhone();
  }, []);

  const triggerShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const handleKeyPress = (val: string) => {
    if (balanceResult) return;
    if (val === 'backspace') {
      setPin(prev => prev.slice(0, -1));
      setErrorMsg('');
    } else {
      if (pin.length >= 6) return;
      setPin(prev => prev + val);
      setErrorMsg('');
    }
  };

  const handleConfirm = async () => {
    if (pin.length < 6) return;
    setLoading(true);
    setErrorMsg('');
    try {
      const response = await fetch(`${API_HOST}/api/check-balance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, bankName, pin }),
      });
      const data = await response.json();
      if (data.success) {
        // Real balance from DB: monthlyLimit + carryOverBalance - monthlySpent
        const realBalance = data.availableBalance ?? 0;
        setBalanceResult(`\u20b9${realBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`);
      } else {
        setPin('');
        setErrorMsg(data.message || 'Wrong PIN. Please try again.');
        triggerShake();
      }
    } catch (err) {
      console.error('Check balance error:', err);
      setPin('');
      setErrorMsg('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const maskedAccount = accountNumber.length >= 4
    ? `....${accountNumber.slice(-4)}`
    : '....XXXX';

  // Balance result view
  if (balanceResult) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <View style={styles.upiLogoSection}>
          <UpiLogo />
        </View>
        <View style={styles.bankHeaderRow}>
          <Text style={styles.bankHeaderName}>{bankName}</Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
            <Ionicons name="close" size={22} color="#5f6368" />
          </TouchableOpacity>
        </View>
        <View style={styles.balanceCard}>
          <View style={styles.balanceCardTop}>
            <View>
              <Text style={styles.balanceLabel}>Account Balance</Text>
              <Text style={styles.balanceSubLabel}>{bankName} • {maskedAccount}</Text>
            </View>
            <RupeeIcon />
          </View>
          <Text style={styles.balanceValue}>{balanceResult}</Text>
          <Text style={styles.balanceNote}>As of today</Text>
        </View>
        <TouchableOpacity style={styles.doneBtn} onPress={() => router.back()}>
          <Text style={styles.doneBtnText}>Done</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // PIN entry view
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* UPI Logo — ~11% screen height at top */}
      <View style={styles.upiLogoSection}>
        <UpiLogo />
      </View>

      {/* Bank name + X close */}
      <View style={styles.bankHeaderRow}>
        <Text style={styles.bankHeaderName}>{bankName}</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <Ionicons name="close" size={22} color="#5f6368" />
        </TouchableOpacity>
      </View>

      {/* Info card */}
      <View style={styles.infoCard}>
        <View style={styles.infoCardRow}>
          <Text style={styles.infoCardText}>You are checking your{'\n'}account balance</Text>
          <RupeeIcon />
        </View>
      </View>

      {/* PIN circles */}
      <View style={styles.pinSection}>
        <Text style={styles.pinLabel}>Enter UPI PIN</Text>
        <Animated.View style={[styles.circlesRow, { transform: [{ translateX: shakeAnim }] }]}>
          {[0, 1, 2, 3, 4, 5].map(idx => {
            const filled = pin.length > idx;
            return (
              <View
                key={idx}
                style={[
                  styles.pinCircle,
                  filled ? styles.pinCircleFilled : styles.pinCircleEmpty,
                ]}
              />
            );
          })}
        </Animated.View>
        {errorMsg !== '' && (
          <Text style={styles.errorText}>{errorMsg}</Text>
        )}
      </View>

      {/* Capsule Keypad */}
      <View style={styles.keypadWrapper}>
        {[['1', '2', '3'], ['4', '5', '6'], ['7', '8', '9']].map((row, ri) => (
          <View key={ri} style={styles.keypadRow}>
            {row.map(num => (
              <TouchableOpacity
                key={num}
                style={styles.capsuleKey}
                onPress={() => handleKeyPress(num)}
                activeOpacity={0.7}
              >
                <Text style={styles.capsuleKeyText}>{num}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}
        <View style={styles.keypadRow}>
          <TouchableOpacity
            style={styles.capsuleKey}
            onPress={() => handleKeyPress('backspace')}
            activeOpacity={0.7}
          >
            <Ionicons name="backspace-outline" size={22} color="#3d3d3c" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.capsuleKey}
            onPress={() => handleKeyPress('0')}
            activeOpacity={0.7}
          >
            <Text style={styles.capsuleKeyText}>0</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.capsuleKey,
              styles.confirmKey,
              (pin.length < 6 || loading) && styles.confirmKeyDisabled,
            ]}
            onPress={handleConfirm}
            disabled={pin.length < 6 || loading}
            activeOpacity={0.8}
          >
            <Text style={styles.confirmKeyText}>{loading ? '...' : 'Check'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  upiLogoSection: {
    height: SCREEN_HEIGHT * 0.09,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    marginLeft:20,
    paddingTop: 8,
  },
  bankHeaderRow: {
    marginTop:-50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 30,
    paddingVertical: 4,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e0e0e00d',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e0e0e00b',
  },
  bankHeaderName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#202124',
    flex: 1,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f1f3f4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoCard: {
    marginHorizontal: 20,
    marginTop: 20,
    backgroundColor: '#f0f4ff',
    borderRadius: 16,
    padding: 18,
  },
  infoCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  infoCardText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a3a6b',
    lineHeight: 22,
    flex: 1,
    marginRight: 12,
  },
  // Balance result card
  balanceCard: {
    marginHorizontal: 20,
    marginTop: 20,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
  },
  balanceCardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  balanceLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#17181aff',
  },
  balanceSubLabel: {
    fontSize: 12,
    color: '#5f6368',
    marginTop: 4,
  },
  balanceValue: {
    fontSize: 34,
    fontWeight: '800',
    color: '#252628ff',
    marginBottom: 6,
  },
  balanceNote: {
    fontSize: 12,
    color: '#5f6368',
  },
  doneBtn: {
    marginHorizontal: 20,
    marginTop: 24,
    backgroundColor: '#1a73e8',
    borderRadius: 28,
    paddingVertical: 14,
    alignItems: 'center',
  },
  doneBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  // PIN circles
  pinSection: {
    alignItems: 'center',
    marginTop: 100,
    paddingHorizontal: 20,
  },
  pinLabel: {
    fontSize: 13,
    fontWeight: '900',
    color: '#5f6368',
    letterSpacing: 0.6,
    marginBottom: 24,
    textTransform: 'uppercase',
  },
  circlesRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 14,
  },
  pinCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
  },
  pinCircleEmpty: {
    borderWidth: 1,
    borderColor: '#474747ff',
    backgroundColor: 'transparent',
  },
  pinCircleFilled: {
    backgroundColor: '#0d2b6b',
    borderWidth: 0,
  },
  errorText: {
    color: '#ea4335',
    fontSize: 13,
    marginTop: 10,
    textAlign: 'center',
  },
  // Capsule keypad
  keypadWrapper: {
    paddingHorizontal: 18,
    paddingBottom: 1,
    paddingTop: 20,
    marginTop: 'auto',
    backgroundColor:'#f1f3f4',
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  capsuleKey: {
    flex: 1,
    height: 55,
    marginHorizontal:3,
    borderRadius: 50,
    backgroundColor: '#ffffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  capsuleKeyText: {
    fontSize: 32,
    fontWeight: '600',
    color: '#202124',
  },
  confirmKey: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#0d2b6b',
  },
  confirmKeyDisabled: {
    backgroundColor: '#b0bec5',
  },
  confirmKeyText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#ffffff',
  },
});
