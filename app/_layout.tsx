import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import React, { useState, useEffect, useRef } from 'react';
import { AppState, AppStateStatus, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';
import { Ionicons } from '@expo/vector-icons';

import { useColorScheme } from '@/hooks/use-color-scheme';
import LandingSplashScreen from '@/components/landing-splash-screen';
import AuthFlow from '@/components/auth-flow';
import ProfileForm from '@/components/profile-form';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const [isSplashVisible, setIsSplashVisible] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isProfileComplete, setIsProfileComplete] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Security Lock Screen states
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [showPrivacyOverlay, setShowPrivacyOverlay] = useState(false);

  // Track background time for 1-minute timeout requirement
  const lastBackgroundTimeRef = useRef<number | null>(null);
  const isAuthenticatingRef = useRef(false);

  // Check user session on startup
  useEffect(() => {
    async function checkSession() {
      try {
        const storedAuth = await AsyncStorage.getItem('isAuthenticated');
        if (storedAuth === 'true') {
          setIsAuthenticated(true);
        }
        const storedProfile = await AsyncStorage.getItem('isProfileComplete');
        if (storedProfile === 'true') {
          setIsProfileComplete(true);
        }
      } catch (error) {
        console.error('Failed to load user session:', error);
      } finally {
        setIsAuthLoading(false);
      }
    }
    checkSession();
  }, []);

  // Biometric Authentication Function
  const authenticateUser = async () => {
    if (isAuthenticatingRef.current) {
      console.log('Biometric authentication already in progress.');
      return false;
    }
    isAuthenticatingRef.current = true;
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (hasHardware && isEnrolled) {
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: 'Google Pay needs to verify your identity',
          fallbackLabel: 'Use Passcode',
          disableDeviceFallback: false,
        });

        if (result.success) {
          setIsUnlocked(true);
          setShowPrivacyOverlay(false);
          isAuthenticatingRef.current = false;
          return true;
        } else {
          isAuthenticatingRef.current = false;
          return false;
        }
      } else {
        // If biometrics hardware or enrollment is unavailable on test device, bypass lock
        setIsUnlocked(true);
        setShowPrivacyOverlay(false);
        isAuthenticatingRef.current = false;
        return true;
      }
    } catch (error) {
      console.error('Biometric authentication failed:', error);
      setIsUnlocked(true);
      setShowPrivacyOverlay(false);
      isAuthenticatingRef.current = false;
      return true;
    }
  };

  // Trigger authentication on app startup (1st time after splash screen)
  useEffect(() => {
    if (!isSplashVisible && !isAuthLoading && isAuthenticated && isProfileComplete && !isUnlocked && !isAuthenticatingRef.current) {
      authenticateUser();
    }
  }, [isSplashVisible, isAuthLoading, isAuthenticated, isProfileComplete, isUnlocked]);

  // AppState change listener:
  // 1. Instantly shows "App content hidden" (Image 3 UI) when switching apps / recents view
  // 2. Records background timestamp. If user returns within 1 min (<60s), resumes without fingerprint.
  //    If user returns after 1 min (>=60s), prompts fingerprint again!
  useEffect(() => {
    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      if (nextAppState === 'background' || nextAppState === 'inactive') {
        // App moving out of active foreground view -> Show privacy overlay immediately for Task Switcher!
        setShowPrivacyOverlay(true);
        if (!lastBackgroundTimeRef.current) {
          lastBackgroundTimeRef.current = Date.now();
        }
        try {
          await LocalAuthentication.cancelAuthenticate();
        } catch (err) {
          // ignore error on cancel
        }
        isAuthenticatingRef.current = false;
      } else if (nextAppState === 'active') {
        // User brought app back to foreground
        if (lastBackgroundTimeRef.current) {
          const elapsedSeconds = (Date.now() - lastBackgroundTimeRef.current) / 1000;
          lastBackgroundTimeRef.current = null;

          if (elapsedSeconds >= 60) {
            // Away for 1 minute or more -> Require fingerprint authentication again!
            setIsUnlocked(false);
            setShowPrivacyOverlay(false);
            setTimeout(() => {
              authenticateUser();
            }, 300);
          } else {
            // Away for less than 1 minute -> Resume directly without fingerprint prompt!
            setShowPrivacyOverlay(false);
          }
        } else {
          setShowPrivacyOverlay(false);
        }
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => {
      subscription.remove();
    };
  }, [isAuthenticated, isProfileComplete]);

  const shouldShowPrivacyOverlay = showPrivacyOverlay;
  const shouldShowLockScreen = !isSplashVisible && isAuthenticated && isProfileComplete && !isUnlocked && !showPrivacyOverlay;

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="add-bank" options={{ presentation: 'modal', headerShown: false }} />
        <Stack.Screen name="scan-qr" options={{ headerShown: false }} />
        <Stack.Screen name="self-transfer" options={{ headerShown: false }} />
        <Stack.Screen name="pay-amount" options={{ headerShown: false }} />
        <Stack.Screen name="enter-upi-pin" options={{ headerShown: false }} />
        <Stack.Screen name="set-upi-pin" options={{ headerShown: false }} />
        <Stack.Screen name="check-balance" options={{ headerShown: false }} />
        <Stack.Screen name="profile" options={{ headerShown: false }} />
        <Stack.Screen name="pay-anyone" options={{ headerShown: false }} />
        <Stack.Screen name="my-qr" options={{ headerShown: false }} />
        <Stack.Screen name="rewards" options={{ headerShown: false }} />
        <Stack.Screen name="upi-lite" options={{ headerShown: false }} />
        <Stack.Screen name="referrals" options={{ headerShown: false }} />
        <Stack.Screen name="pocket-money" options={{ headerShown: false }} />
        <Stack.Screen name="autopay" options={{ headerShown: false }} />
        <Stack.Screen name="language" options={{ headerShown: false }} />
        <Stack.Screen name="settings" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
      
      {/* 1. Launch/Landing splash screen animation */}
      {isSplashVisible && (
        <LandingSplashScreen onAnimationComplete={() => setIsSplashVisible(false)} />
      )}

      {/* 2. Login Flow (SMS OTP) */}
      {!isSplashVisible && !isAuthLoading && !isAuthenticated && (
        <AuthFlow onAuthSuccess={() => {
          setIsAuthenticated(true);
          setIsSplashVisible(true);
        }} />
      )}

      {/* 3. Profile Registration Form */}
      {!isSplashVisible && !isAuthLoading && isAuthenticated && !isProfileComplete && (
        <ProfileForm onSaveSuccess={() => {
          setIsProfileComplete(true);
          setIsSplashVisible(true);
        }} />
      )}

      {/* 4. App Content Hidden (Privacy Overlay shown in Task Switcher / App Switcher) - Matching Image 3 */}
      {shouldShowPrivacyOverlay && (
        <View style={[styles.privacyContainer, { backgroundColor: isDark ? '#1f1f1f' : '#ffffff' }]}>
          <View style={styles.privacyCard}>
            <Ionicons name="eye-off-outline" size={60} color={isDark ? '#8ab4f8' : '#70757a'} style={{ marginBottom: 16 }} />
            <Text style={[styles.privacyText, { color: isDark ? '#e8eaed' : '#5f6368' }]}>App content hidden</Text>
          </View>
        </View>
      )}

      {/* 5. Fingerprint Security Lock Screen (When locked after 1-min background timeout or 1st launch) */}
      {shouldShowLockScreen && (
        <View style={[styles.lockScreenContainer, { backgroundColor: isDark ? '#121212' : '#ffffff' }]}>
          <View style={styles.lockContent}>
            <View style={[styles.brandIconContainer, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#e8f0fe' }]}>
              <Ionicons name="lock-closed" size={44} color={isDark ? '#8ab4f8' : '#1a73e8'} />
            </View>
            <Text style={[styles.lockTitle, { color: isDark ? '#ffffff' : '#202124' }]}>Google Pay</Text>
            <Text style={[styles.lockSubtitle, { color: isDark ? '#9aa0a6' : '#5f6368' }]}>
              Locked for your security
            </Text>

            <TouchableOpacity 
              style={styles.unlockButton} 
              onPress={async () => {
                isAuthenticatingRef.current = false;
                await authenticateUser();
              }}
            >
              <Ionicons name="finger-print" size={22} color={isDark ? '#8ab4f8' : '#1a73e8'} style={styles.unlockIcon} />
              <Text style={[styles.unlockButtonText, { color: isDark ? '#8ab4f8' : '#1a73e8' }]}>Unlock GPay</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  privacyContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999999,
  },
  privacyCard: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  privacyText: {
    fontSize: 18,
    fontWeight: '500',
    textAlign: 'center',
  },
  lockScreenContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 99999,
  },
  lockContent: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  brandIconContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  lockTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  lockSubtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 20,
  },
  unlockButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#1a73e8',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 36,
    borderRadius: 24,
    marginTop: 32,
  },
  unlockIcon: {
    marginRight: 8,
  },
  unlockButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
