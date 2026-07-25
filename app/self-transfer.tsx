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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BANKS_LIST } from './add-bank';

interface BankAccount {
  bankName: string;
  accountNumber: string;
  upiId: string;
  isDefault: boolean;
  monthlyLimit?: number;
  monthlySpent?: number;
  carryOverBalance?: number;
}

export default function SelfTransferScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const router = useRouter();

  const themeBg = isDark ? '#121212' : '#f8f9fa';
  const themeCardBg = isDark ? '#202124' : '#ffffff';
  const themeTextColor = isDark ? '#ffffff' : '#202124';
  const themeSubText = isDark ? '#9aa0a6' : '#5f6368';
  const themeBorder = isDark ? '#3c4043' : '#dadce0';

  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [fromAccount, setFromAccount] = useState<BankAccount | null>(null);
  const [toAccount, setToAccount] = useState<BankAccount | null>(null);

  useEffect(() => {
    async function loadAccounts() {
      try {
        const stored = await AsyncStorage.getItem('bank_accounts');
        if (stored) {
          const list = JSON.parse(stored);
          setAccounts(list);
          if (list.length >= 2) {
            setFromAccount(list[0]);
            setToAccount(list[1]);
          } else if (list.length === 1) {
            setFromAccount(list[0]);
          }
        }
      } catch (err) {
        console.error('Error loading accounts for self transfer:', err);
      }
    }
    loadAccounts();
  }, []);

  const handleSwap = () => {
    if (fromAccount && toAccount) {
      const temp = fromAccount;
      setFromAccount(toAccount);
      setToAccount(temp);
    }
  };

  const handleProceed = () => {
    if (!fromAccount || !toAccount) {
      Alert.alert('Selection Required', 'Please select both source and destination accounts.');
      return;
    }
    if (fromAccount.bankName === toAccount.bankName && fromAccount.accountNumber === toAccount.accountNumber) {
      Alert.alert('Invalid Selection', 'Source and destination accounts must be different.');
      return;
    }

    router.push({
      pathname: '/pay-amount',
      params: {
        recipientName: `Self: ${toAccount.bankName}`,
        recipientUpiId: toAccount.upiId,
        fromBankName: fromAccount.bankName,
        toBankName: toAccount.bankName,
        type: 'self_transfer',
      },
    } as any);
  };

  const renderLogo = (bankName: string, size: number = 32) => {
    const bankDetail = BANKS_LIST.find(b => b.name === bankName);
    return (
      <View style={[styles.logoWrapper, { width: size, height: size, borderRadius: size / 2, backgroundColor: bankDetail?.useLocalAsset ? '#ffffff' : (bankDetail?.color || '#1a73e8') }]}>
        {bankDetail?.useLocalAsset ? (
          <Image source={bankDetail.localAssetSource} style={styles.logoImage} resizeMode="contain" />
        ) : bankDetail?.domain ? (
          <Image 
            source={{ uri: `https://img.logo.dev/${bankDetail.domain}?token=pk_K5tbWMjaQYadU9Se2KkiXQ` }} 
            style={[styles.logoImage, { backgroundColor: '#ffffff' }]} 
            resizeMode="contain" 
          />
        ) : (
          <Ionicons name="card" size={size * 0.5} color="#ffffff" />
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeBg }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={themeTextColor} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: themeTextColor }]}>Self Transfer</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        {/* Selector Preview Card */}
        {fromAccount && (
          <View style={[styles.previewCard, { backgroundColor: themeCardBg, borderColor: themeBorder }]}>
            
            {/* From Slot */}
            <View style={styles.slotRow}>
              <View style={styles.slotLabelCol}>
                <Text style={styles.slotLabel}>Transfer from</Text>
                <Text style={[styles.slotBankName, { color: themeTextColor }]}>{fromAccount.bankName}</Text>
                <Text style={styles.slotAcc}>{fromAccount.accountNumber}</Text>
              </View>
              {renderLogo(fromAccount.bankName, 40)}
            </View>

            {/* Divider with Swap Button */}
            <View style={[styles.dividerRow, { borderColor: themeBorder }]}>
              {toAccount && (
                <TouchableOpacity style={styles.swapBtn} onPress={handleSwap}>
                  <Ionicons name="swap-vertical" size={20} color="#1a73e8" />
                </TouchableOpacity>
              )}
            </View>

            {/* To Slot */}
            <View style={styles.slotRow}>
              <View style={styles.slotLabelCol}>
                <Text style={styles.slotLabel}>Transfer to</Text>
                {toAccount ? (
                  <>
                    <Text style={[styles.slotBankName, { color: themeTextColor }]}>{toAccount.bankName}</Text>
                    <Text style={styles.slotAcc}>{toAccount.accountNumber}</Text>
                  </>
                ) : (
                  <Text style={[styles.slotPlaceholder, { color: themeSubText }]}>Select destination bank below</Text>
                )}
              </View>
              {toAccount ? renderLogo(toAccount.bankName, 40) : (
                <View style={styles.emptyCircle}>
                  <Ionicons name="add" size={24} color={themeSubText} />
                </View>
              )}
            </View>

          </View>
        )}

        {/* Bank Selection Grid */}
        <Text style={[styles.sectionTitle, { color: themeTextColor }]}>Select Account</Text>
        
        <View style={styles.listWrapper}>
          <Text style={[styles.subLabel, { color: themeSubText }]}>Select Source Bank (From)</Text>
          {accounts.map((acc, idx) => {
            const isSelected = fromAccount?.bankName === acc.bankName && fromAccount?.accountNumber === acc.accountNumber;
            return (
              <TouchableOpacity
                key={`from-${idx}`}
                style={[styles.accountItem, { backgroundColor: isSelected ? '#e8f0fe' : themeCardBg, borderColor: isSelected ? '#1a73e8' : themeBorder }]}
                onPress={() => {
                  setFromAccount(acc);
                  if (toAccount?.bankName === acc.bankName && toAccount?.accountNumber === acc.accountNumber) {
                    setToAccount(null);
                  }
                }}
              >
                {renderLogo(acc.bankName, 36)}
                <View style={styles.itemInfo}>
                  <Text style={[styles.itemBank, { color: themeTextColor }]}>{acc.bankName}</Text>
                  <Text style={[styles.itemDetails, { color: themeSubText }]}>{acc.accountNumber} • Limit: ₹{(acc.monthlyLimit || 10000) + (acc.carryOverBalance || 0) - (acc.monthlySpent || 0)} left</Text>
                </View>
                {isSelected && <Ionicons name="checkmark-circle" size={22} color="#1a73e8" />}
              </TouchableOpacity>
            );
          })}

          <Text style={[styles.subLabel, { color: themeSubText, marginTop: 16 }]}>Select Destination Bank (To)</Text>
          {accounts.map((acc, idx) => {
            const isSelected = toAccount?.bankName === acc.bankName && toAccount?.accountNumber === acc.accountNumber;
            const isSource = fromAccount?.bankName === acc.bankName && fromAccount?.accountNumber === acc.accountNumber;
            return (
              <TouchableOpacity
                key={`to-${idx}`}
                style={[
                  styles.accountItem,
                  { backgroundColor: isSelected ? '#e8f0fe' : themeCardBg, borderColor: isSelected ? '#1a73e8' : themeBorder },
                  isSource && { opacity: 0.4 }
                ]}
                disabled={isSource}
                onPress={() => setToAccount(acc)}
              >
                {renderLogo(acc.bankName, 36)}
                <View style={styles.itemInfo}>
                  <Text style={[styles.itemBank, { color: themeTextColor }]}>{acc.bankName}</Text>
                  <Text style={[styles.itemDetails, { color: themeSubText }]}>{acc.accountNumber} • Limit: ₹{(acc.monthlyLimit || 10000) + (acc.carryOverBalance || 0) - (acc.monthlySpent || 0)} left</Text>
                </View>
                {isSelected && <Ionicons name="checkmark-circle" size={22} color="#1a73e8" />}
              </TouchableOpacity>
            );
          })}
        </View>

        {accounts.length < 2 && (
          <View style={styles.warnBox}>
            <Ionicons name="warning-outline" size={20} color="#ff9800" style={{ marginRight: 8 }} />
            <Text style={styles.warnText}>Please link at least 2 bank accounts to enable self transfers.</Text>
          </View>
        )}

      </ScrollView>

      {/* Action Footer */}
      <View style={[styles.footer, { borderTopColor: themeBorder, backgroundColor: themeCardBg }]}>
        <TouchableOpacity
          style={[styles.proceedBtn, (!fromAccount || !toAccount) && styles.disabledBtn]}
          onPress={handleProceed}
          disabled={!fromAccount || !toAccount}
        >
          <Text style={styles.proceedBtnText}>Proceed to Pay</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: 'transparent',
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  scrollContainer: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  previewCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  slotRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  slotLabelCol: {
    flex: 1,
  },
  slotLabel: {
    fontSize: 12,
    color: '#80868b',
    marginBottom: 4,
  },
  slotBankName: {
    fontSize: 16,
    fontWeight: '700',
  },
  slotAcc: {
    fontSize: 13,
    color: '#80868b',
    marginTop: 2,
  },
  slotPlaceholder: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  dividerRow: {
    height: 1,
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  swapBtn: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#e8f0fe',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d2e3fc',
  },
  logoWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  emptyCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#dadce0',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  listWrapper: {
    marginBottom: 20,
  },
  subLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  accountItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  itemBank: {
    fontSize: 15,
    fontWeight: '600',
  },
  itemDetails: {
    fontSize: 12,
    marginTop: 2,
  },
  warnBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#fff3cd',
    marginTop: 10,
  },
  warnText: {
    flex: 1,
    color: '#856404',
    fontSize: 13,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
  },
  proceedBtn: {
    backgroundColor: '#1a73e8',
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledBtn: {
    backgroundColor: '#80868b',
    opacity: 0.5,
  },
  proceedBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'bold',
  },
});
