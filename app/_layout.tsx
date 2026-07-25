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

  const isAuthenticatingRef = useRef(false);

  // Biometric Authentication Function
  const authenticateUser = async () => {
    if (isAuthenticatingRef.current) {
      console.log('Biometric authentication already in progress. Ignoring duplicate request.');
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
        // Device doesn't have/support biometrics; bypass or assume unlocked
        setIsUnlocked(true);
        setShowPrivacyOverlay(false);
        isAuthenticatingRef.current = false;
        return true;
      }
    } catch (error) {
      console.error('Biometric authentication failed:', error);
      setIsUnlocked(true);
      isAuthenticatingRef.current = false;
      return true;
    }
  };

  // Trigger authentication on app startup (once splash is gone and user is authenticated)
  useEffect(() => {
    if (!isSplashVisible && !isAuthLoading && isAuthenticated && isProfileComplete && !isUnlocked && !isAuthenticatingRef.current) {
      authenticateUser();
    }
  }, [isSplashVisible, isAuthLoading, isAuthenticated, isProfileComplete, isUnlocked]);

  // AppState change listener for switcher privacy overlay and background locking
  useEffect(() => {
    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      if (nextAppState === 'background') {
        // Hide content immediately when app goes to background (user pressed home button)
        try {
          await LocalAuthentication.cancelAuthenticate();
        } catch (err) {
          console.log('Error canceling biometrics:', err);
        }
        setIsUnlocked(false);
        setShowPrivacyOverlay(true);
        isAuthenticatingRef.current = false; // Reset lock to prevent native OS hangs!
      } else if (nextAppState === 'inactive') {
        // App goes to App Switcher mode or system prompt overlays app.
        // Secure screen immediately. But do NOT reset isUnlocked to false if we are currently
        // authenticating to prevent feedback loops with system prompts!
        setShowPrivacyOverlay(true);
        if (!isAuthenticatingRef.current) {
          setIsUnlocked(false);
        }
      } else if (nextAppState === 'active') {
        // App returned to active state. We do NOT auto-trigger to avoid native lifecycle hangs.
        // The user will tap the "Unlock GPay" button which is now 100% reliable.
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => {
      subscription.remove();
    };
  }, [isAuthenticated, isProfileComplete, isUnlocked]);

  const shouldShowLockScreen = !isSplashVisible && isAuthenticated && isProfileComplete && (!isUnlocked || showPrivacyOverlay);

  const themeBgColor = isDark ? '#121212' : '#ffffff';
  const themeTextColor = isDark ? '#ffffff' : '#202124';

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

      {/* 2. Login Flow (asks for country code, phone number, and SMS OTP verification) */}
      {!isSplashVisible && !isAuthLoading && !isAuthenticated && (
        <AuthFlow onAuthSuccess={() => {
          setIsAuthenticated(true);
          setIsSplashVisible(true);
        }} />
      )}

      {/* 3. Profile Registration Form (asks for Name, Age, DoB) */}
      {!isSplashVisible && !isAuthLoading && isAuthenticated && !isProfileComplete && (
        <ProfileForm onSaveSuccess={() => {
          setIsProfileComplete(true);
          setIsSplashVisible(true);
        }} />
      )}

      {/* 4. Fingerprint Security Lock / Privacy Screen Overlay */}
      {shouldShowLockScreen && (
        <View style={[styles.lockScreenContainer, { backgroundColor: isDark ? '#121212' : '#ffffff' }]}>
          <View style={styles.lockContent}>
            <View style={[styles.brandIconContainer, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#e8f0fe' }]}>
              <Ionicons name="lock-closed" size={48} color={isDark ? '#ffffff' : '#1a73e8'} />
            </View>
            <Text style={[styles.lockTitle, { color: isDark ? '#ffffff' : '#202124' }]}>Google Pay</Text>
            <Text style={[styles.lockSubtitle, { color: isDark ? '#9aa0a6' : '#5f6368' }]}>
              Locked for your security
            </Text>

            <TouchableOpacity 
              style={styles.unlockButton} 
              onPress={async () => {
                // Force reset lock on manual tap to resolve native concurrency hangs
                isAuthenticatingRef.current = false;
                await authenticateUser();
              }}
            >
              <Ionicons name="finger-print" size={20} color={isDark ? '#ffffff' : '#000000'} style={styles.unlockIcon} />
              <Text style={[styles.unlockButtonText, { color: isDark ? '#ffffff' : '#000000' }]}>Unlock GPay</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  lockScreenContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 99999, // Overlay everything
  },
  lockContent: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  brandIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
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
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  unlockButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#dadce0',
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
    fontWeight: 'bold',
  },
});
