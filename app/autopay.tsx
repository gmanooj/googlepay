import React, { useState, useEffect } from 'react';
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
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons, FontAwesome6 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';

interface AutopayItem {
  id: string;
  name: string;
  upiId: string;
  amount: string;
  statusText: string;
  category: 'Live' | 'Pending' | 'Completed';
  logoUrl?: string;
  fallbackLetter?: string;
  bgHex?: string;
}

export default function AutopayScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [activeTab, setActiveTab] = useState<'Live' | 'Pending' | 'Completed'>('Live');
  const [autopayList, setAutopayList] = useState<AutopayItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAutopays() {
      try {
        const hostUri = Constants.expoConfig?.hostUri;
        const localIp = hostUri ? hostUri.split(':')[0] : 'localhost';
        const apiHost = `http://${localIp}:5000`;
        const res = await fetch(`${apiHost}/api/get-autopays`);
        const data = await res.json();
        if (data.success && Array.isArray(data.autopays)) {
          setAutopayList(data.autopays);
        }
      } catch (e) {
        console.error('Failed to load autopays from API:', e);
      } finally {
        setLoading(false);
      }
    }
    fetchAutopays();
  }, []);

  const themeBgColor = isDark ? '#121212' : '#ffffff';
  const themeTextColor = isDark ? '#ffffff' : '#202124';
  const themeSubTextColor = isDark ? '#9aa0a6' : '#5f6368';
  const themeBorderColor = isDark ? '#3c4043' : '#dadce0';

  const filteredItems = autopayList.filter(item => item.category === activeTab);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: isDark ? '#121212' : '#f0f4f9' }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* TOP NAV BAR */}
      <View style={styles.topNavRow}>
        <TouchableOpacity style={styles.navIconButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={themeTextColor} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navIconButton} onPress={() => Alert.alert('Menu', 'Autopay settings')}>
          <Ionicons name="ellipsis-vertical" size={22} color={themeTextColor} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* HERO SECTION */}
        <View style={styles.heroSection}>
          <View style={styles.heroLeft}>
            <Text style={[styles.heroTitle, { color: themeTextColor }]}>Automatic payments</Text>
            <Text style={[styles.heroSub, { color: themeSubTextColor }]}>Set up once and never miss a deadline</Text>
            
            <TouchableOpacity 
              style={styles.howToBtn}
              onPress={() => Alert.alert('How Autopay Works', 'Autopay automatically pays recurring subscriptions and bills on due dates.')}
            >
              <Text style={styles.howToBtnText}>How to use Autopay</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.heroRightGraphic}>
            <Ionicons name="card" size={54} color="#0b57d0" />
          </View>
        </View>

        {/* TABS ROW */}
        <View style={[styles.tabsSheetContainer, { backgroundColor: themeBgColor }]}>
          <View style={[styles.tabsHeaderRow, { borderBottomColor: themeBorderColor }]}>
            <TouchableOpacity style={styles.tabBtn} onPress={() => setActiveTab('Live')}>
              <Text style={[styles.tabLabel, { color: activeTab === 'Live' ? '#0b57d0' : themeSubTextColor, fontWeight: activeTab === 'Live' ? '800' : '600' }]}>
                Live
              </Text>
              {activeTab === 'Live' && <View style={styles.activeTabLine} />}
            </TouchableOpacity>

            <TouchableOpacity style={styles.tabBtn} onPress={() => setActiveTab('Pending')}>
              <Text style={[styles.tabLabel, { color: activeTab === 'Pending' ? '#0b57d0' : themeSubTextColor, fontWeight: activeTab === 'Pending' ? '800' : '600' }]}>
                Pending
              </Text>
              {activeTab === 'Pending' && <View style={styles.activeTabLine} />}
            </TouchableOpacity>

            <TouchableOpacity style={styles.tabBtn} onPress={() => setActiveTab('Completed')}>
              <Text style={[styles.tabLabel, { color: activeTab === 'Completed' ? '#0b57d0' : themeSubTextColor, fontWeight: activeTab === 'Completed' ? '800' : '600' }]}>
                Completed
              </Text>
              {activeTab === 'Completed' && <View style={styles.activeTabLine} />}
            </TouchableOpacity>
          </View>

          {/* LIST ITEMS */}
          <View style={styles.autopayListContainer}>
            {loading ? (
              <View style={styles.loadingBox}>
                <ActivityIndicator size="large" color="#0b57d0" />
              </View>
            ) : filteredItems.length > 0 ? (
              filteredItems.map(item => (
                <TouchableOpacity 
                  key={item.id} 
                  style={[styles.autopayItemRow, { borderBottomColor: 'rgba(0,0,0,0.06)' }]}
                  onPress={() => Alert.alert(item.name, `${item.upiId}\n${item.amount}\n${item.statusText}`)}
                >
                  {/* DYNAMIC LOGO FETCHED FROM API */}
                  <View style={[styles.itemAvatar, { backgroundColor: item.bgHex || '#ffffff', borderWidth: 1, borderColor: '#dadce0' }]}>
                    {item.logoUrl ? (
                      <Image 
                        source={{ uri: item.logoUrl }} 
                        style={styles.logoImage} 
                        resizeMode="contain" 
                      />
                    ) : item.name === 'GOOGLE' ? (
                      <Ionicons name="logo-google" size={22} color="#ea4335" />
                    ) : (
                      <Text style={styles.itemAvatarText}>{item.fallbackLetter || item.name.charAt(0)}</Text>
                    )}
                  </View>

                  <View style={styles.itemMainCol}>
                    <View style={styles.itemTitleRow}>
                      <Text style={[styles.itemName, { color: themeTextColor }]}>{item.name}</Text>
                      <Text style={[styles.itemAmount, { color: themeTextColor }]}>{item.amount}</Text>
                    </View>

                    <View style={styles.itemSubRow}>
                      <Text style={[styles.itemUpi, { color: themeSubTextColor }]}>{item.upiId}</Text>
                      <Text style={[styles.itemAsPresented, { color: themeSubTextColor }]}>As presented</Text>
                    </View>

                    <View style={styles.itemStatusRow}>
                      <Ionicons name="checkmark-circle" size={16} color="#0f9d58" style={{ marginRight: 6 }} />
                      <Text style={styles.itemStatusText}>{item.statusText}</Text>
                      <Ionicons name="chevron-forward" size={18} color="#0b57d0" style={{ marginLeft: 'auto' }} />
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyStateBox}>
                <Ionicons name="file-tray-outline" size={48} color={themeSubTextColor} />
                <Text style={[styles.emptyText, { color: themeSubTextColor }]}>No {activeTab.toLowerCase()} automatic payments</Text>
              </View>
            )}
          </View>
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
  scrollView: {
    flex: 1,
  },
  heroSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 24,
  },
  heroLeft: {
    flex: 1,
    paddingRight: 12,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 6,
  },
  heroSub: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 16,
  },
  howToBtn: {
    borderWidth: 1.5,
    borderColor: '#0b57d0',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  howToBtnText: {
    color: '#0b57d0',
    fontSize: 13,
    fontWeight: '800',
  },
  heroRightGraphic: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabsSheetContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    minHeight: 600,
  },
  tabsHeaderRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    paddingHorizontal: 20,
  },
  tabBtn: {
    paddingVertical: 16,
    marginRight: 32,
    position: 'relative',
  },
  tabLabel: {
    fontSize: 15,
  },
  activeTabLine: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: '#0b57d0',
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  autopayListContainer: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  loadingBox: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  autopayItemRow: {
    flexDirection: 'row',
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  itemAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    overflow: 'hidden',
  },
  logoImage: {
    width: 32,
    height: 32,
    borderRadius: 6,
  },
  itemAvatarText: {
    color: '#202124',
    fontSize: 18,
    fontWeight: 'bold',
  },
  itemMainCol: {
    flex: 1,
  },
  itemTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '800',
  },
  itemAmount: {
    fontSize: 15,
    fontWeight: '800',
  },
  itemSubRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemUpi: {
    fontSize: 13,
    fontWeight: '500',
  },
  itemAsPresented: {
    fontSize: 12,
    fontWeight: '500',
  },
  itemStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemStatusText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#202124',
  },
  emptyStateBox: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '600',
    marginTop: 12,
  },
});
