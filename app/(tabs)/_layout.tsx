import { Tabs, useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons, FontAwesome6 } from '@expo/vector-icons';

import { HapticTab } from '@/components/haptic-tab';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [userName, setUserName] = useState('U');

  // Load user name first letter for tab avatar
  useEffect(() => {
    async function loadUserName() {
      try {
        const storedDetails = await AsyncStorage.getItem('user_details');
        if (storedDetails) {
          const parsed = JSON.parse(storedDetails);
          if (parsed.name) {
            setUserName(parsed.name);
            return;
          }
        }
        const storedName = await AsyncStorage.getItem('user_name');
        if (storedName) {
          setUserName(storedName);
        }
      } catch (error) {
        console.error('Failed to load user name in layout:', error);
      }
    }
    loadUserName();
  }, []);

  const firstLetter = userName.charAt(0).toUpperCase();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#1a73e8',
        tabBarInactiveTintColor: isDark ? '#9aa0a6' : '#5f6368',
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: isDark ? '#1b1b1b' : '#ffffff',
          borderTopColor: isDark ? '#3c4043' : '#dadce0',
          height: 60,
          paddingBottom: 8,
        },
      }}>
      
      {/* 1. HOME TAB */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={24} color={color} />
          ),
        }}
      />

      {/* 2. MONEY TAB */}
      <Tabs.Screen
        name="money"
        options={{
          title: 'Money',
          tabBarIcon: ({ color, focused }) => (
            <FontAwesome6 name="indian-rupee-sign" size={20} color={color} style={focused ? styles.focusedRupee : null} />
          ),
        }}
      />

      {/* 3. YOU TAB (Profile Navigation) */}
      <Tabs.Screen
        name="explore"
        options={{
          title: 'You',
          tabBarIcon: ({ color, focused }) => (
            <View
              style={[
                styles.avatarCircle,
                {
                  backgroundColor: '#2e7d32',
                  borderWidth: focused ? 2 : 1,
                  borderColor: focused ? '#1a73e8' : isDark ? '#5f6368' : '#ffffff',
                },
              ]}
            >
              <Text style={styles.avatarText}>
                {firstLetter}
              </Text>
            </View>
          ),
        }}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            router.push('/profile');
          },
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  avatarCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  focusedRupee: {
    transform: [{ scale: 1.1 }],
  },
});
