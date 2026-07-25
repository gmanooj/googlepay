import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  useColorScheme,
  StatusBar,
  TextInput,
  Modal,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BANKS_LIST } from './add-bank';

const PERSON_IMAGE_MAP: { [key: string]: any } = {
  'tn_m1': require('@/assets/images/male1.jpg'),
  'tn_f1': require('@/assets/images/female1.jpg'),
  'tn_m2': require('@/assets/images/male2.jpg'),
  'ap_f1': require('@/assets/images/female2.png'),
  'ap_m1': require('@/assets/images/male3.png'),
  'ka_f1': require('@/assets/images/female3.png'),
  'kl_f1': require('@/assets/images/female4.png'),
  'b_jio': require('@/assets/images/jio.png'),
  'b_dominos': require('@/assets/images/dominos.png'),
};

interface BankAccount {
  bankName: string;
  accountNumber: string;
  upiId: string;
  isDefault: boolean;
  upiPin?: string;
  monthlyLimit?: number;
  monthlySpent?: number;
  carryOverBalance?: number;
}

export default function PayAmountScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const router = useRouter();
  const params = useLocalSearchParams();

  const recipientName = (params.recipientName as string) || 'Recipient';
  const recipientUpiId = (params.recipientUpiId as string) || 'recipient@upi';
  const fromBankNameParam = params.fromBankName as string;
  const toBankNameParam = params.toBankName as string;
  const transactionType = (params.type as string) || 'person';

  const themeBg = isDark ? '#121212' : '#ffffff';
  const themeTextColor = isDark ? '#ffffff' : '#202124';
  const themeSubText = isDark ? '#9aa0a6' : '#5f6368';
  const themeBorder = isDark ? '#3c4043' : '#dadce0';
  const themeCardBg = isDark ? '#202124' : '#f8f9fa';

  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [editableRecipientName, setEditableRecipientName] = useState(recipientName);
  const [showEditNameModal, setShowEditNameModal] = useState(false);
  const [tempEditName, setTempEditName] = useState(recipientName);

  useEffect(() => {
    if (recipientName) {
      setEditableRecipientName(recipientName);
      setTempEditName(recipientName);
    }
  }, [recipientName]);

  const [selectedAccount, setSelectedAccount] = useState<BankAccount | null>(null);
  const [showBankPicker, setShowBankPicker] = useState(false);
  const [showKeypad, setShowKeypad] = useState(true);

  useEffect(() => {
    async function loadAccounts() {
      try {
        const stored = await AsyncStorage.getItem('bank_accounts');
        if (stored) {
          const list = JSON.parse(stored) as BankAccount[];
          setAccounts(list);
          
          if (fromBankNameParam) {
            const found = list.find(a => a.bankName === fromBankNameParam);
            if (found) {
              setSelectedAccount(found);
              return;
            }
          }
          
          const def = list.find(a => a.isDefault) || list[0];
          setSelectedAccount(def || null);
        }
      } catch (err) {
        console.error('Error loading accounts:', err);
      }
    }
    loadAccounts();
  }, [fromBankNameParam]);

  const handleKeyPress = (val: string) => {
    if (val === 'backspace') {
      setAmount(prev => prev.slice(0, -1));
    } else if (val === '.') {
      if (!amount.includes('.')) {
        setAmount(prev => (prev === '' ? '0.' : prev + '.'));
      }
    } else {
      // Limit to 2 decimal places and max amount length
      if (amount.includes('.')) {
        const parts = amount.split('.');
        if (parts[1].length >= 2) return;
      }
      if (amount === '0') {
        setAmount(val);
      } else {
        setAmount(prev => prev + val);
      }
    }
  };

  const handlePay = () => {
    const paymentAmt = parseFloat(amount);
    if (isNaN(paymentAmt) || paymentAmt <= 0) {
      alert('Please enter a valid amount.');
      return;
    }
    if (!selectedAccount) {
      alert('Please link a bank account first.');
      return;
    }

    // Check if the user already has a PIN set on this account in local state/DB
    const hasPin = selectedAccount.upiPin && selectedAccount.upiPin.length === 6;

    if (!hasPin) {
      // Redirect to Set UPI PIN screen
      router.push({
        pathname: '/set-upi-pin',
        params: {
          bankName: selectedAccount.bankName,
          amount: amount,
          recipientName: editableRecipientName,
          recipientUpiId,
          toBankName: toBankNameParam || '',
          type: transactionType,
          note: note,
        },
      } as any);
    } else {
      // Redirect to Enter UPI PIN screen
      router.push({
        pathname: '/enter-upi-pin',
        params: {
          bankName: selectedAccount.bankName,
          amount: amount,
          recipientName: editableRecipientName,
          recipientUpiId,
          toBankName: toBankNameParam || '',
          type: transactionType,
          note: note,
        },
      } as any);
    }
  };

  const renderLogo = (bankName: string, size: number = 24) => {
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
      
      {/* Top Header Row */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="close" size={26} color={themeTextColor} />
        </TouchableOpacity>
        <Ionicons name="information-circle-outline" size={24} color={themeTextColor} style={{ marginRight: 16 }} />
        <Ionicons name="ellipsis-vertical" size={24} color={themeTextColor} />
      </View>

      {/* Main Content (Paying Recipient Info & Amount Input) */}
      <View style={styles.content}>
        
        {/* Recipient Details */}
        <View style={styles.recipientContainer}>
          <View style={[styles.avatarCircle, { overflow: 'hidden' }]}>
            {params.recipientImage && PERSON_IMAGE_MAP[params.recipientImage as string] ? (
              <Image 
                source={PERSON_IMAGE_MAP[params.recipientImage as string]} 
                style={{ width: '100%', height: '100%' }} 
                resizeMode="cover"
              />
            ) : (
              <Text style={styles.avatarText}>
                {editableRecipientName.replace('Self: ', '').charAt(0).toUpperCase()}
              </Text>
            )}
          </View>
          <Text style={[styles.payeeName, { color: themeTextColor }]}>
            Paying {editableRecipientName}
          </Text>
          <TouchableOpacity 
            style={styles.verifiedRow}
            activeOpacity={0.7}
            onPress={() => {
              setTempEditName(editableRecipientName);
              setShowEditNameModal(true);
            }}
          >
            <Ionicons name="checkmark-circle" size={14} color="#0f9d58" style={{ marginRight: 4 }} />
            <Text style={styles.verifiedText}>Banking name: {editableRecipientName.toUpperCase()}</Text>
            <Ionicons name="pencil-outline" size={12} color={themeSubText} style={{ marginLeft: 6 }} />
          </TouchableOpacity>
          <Text style={styles.upiIdText}>UPI ID: {recipientUpiId}</Text>
        </View>

        {/* Big Amount Input */}
        <TouchableOpacity 
          style={styles.amountContainer}
          activeOpacity={0.7}
          onPress={() => setShowKeypad(prev => !prev)}
        >
          <Text style={[styles.currencySymbol, { color: themeTextColor }]}>₹</Text>
          <Text style={[styles.amountValueText, { color: themeTextColor }]} numberOfLines={1}>
            {amount === '' ? '0' : parseFloat(amount).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
          </Text>
          <View style={styles.cursor} />
        </TouchableOpacity>

        {/* Add note input */}
        <View style={styles.noteContainer}>
          <TextInput
            style={[styles.noteInput, { color: themeTextColor, backgroundColor: themeCardBg }]}
            placeholder="Add a note"
            placeholderTextColor={themeSubText}
            value={note}
            onChangeText={setNote}
            maxLength={50}
          />
        </View>

      </View>

      {/* Dynamic Keypad & Bank Drawer Footer */}
      <View style={[styles.footerContainer, { borderTopColor: themeBorder, backgroundColor: '#ffffff' }]}>
        
        {/* Selected Bank details bar */}
        {selectedAccount && (
          <TouchableOpacity 
            style={[styles.bankSelectorBar, { borderColor: themeBorder }]}
            onPress={() => setShowBankPicker(true)}
          >
            {renderLogo(selectedAccount.bankName, 26)}
            <View style={styles.bankTextCol}>
              <Text style={[styles.bankNameText, { color: themeTextColor }]}>
                {selectedAccount.bankName} - {selectedAccount.accountNumber}
              </Text>
              <Text style={styles.balanceCheckText}>
                Limit left: ₹{(selectedAccount.monthlyLimit || 10000) + (selectedAccount.carryOverBalance || 0) - (selectedAccount.monthlySpent || 0)}
              </Text>
            </View>
            <Ionicons name="chevron-down" size={16} color={themeTextColor} />
          </TouchableOpacity>
        )}

        {/* Custom Numeric Keypad (Collapsible) */}
        {showKeypad && (
          <View style={styles.keypadContainer}>
            <View style={styles.keypadRow}>
              <TouchableOpacity style={styles.keypadKey} onPress={() => handleKeyPress('1')}><Text style={[styles.keyText, { color: themeTextColor }]}>1</Text></TouchableOpacity>
              <TouchableOpacity style={styles.keypadKey} onPress={() => handleKeyPress('2')}><Text style={[styles.keyText, { color: themeTextColor }]}>2</Text></TouchableOpacity>
              <TouchableOpacity style={styles.keypadKey} onPress={() => handleKeyPress('3')}><Text style={[styles.keyText, { color: themeTextColor }]}>3</Text></TouchableOpacity>
            </View>
            <View style={styles.keypadRow}>
              <TouchableOpacity style={styles.keypadKey} onPress={() => handleKeyPress('4')}><Text style={[styles.keyText, { color: themeTextColor }]}>4</Text></TouchableOpacity>
              <TouchableOpacity style={styles.keypadKey} onPress={() => handleKeyPress('5')}><Text style={[styles.keyText, { color: themeTextColor }]}>5</Text></TouchableOpacity>
              <TouchableOpacity style={styles.keypadKey} onPress={() => handleKeyPress('6')}><Text style={[styles.keyText, { color: themeTextColor }]}>6</Text></TouchableOpacity>
            </View>
            <View style={styles.keypadRow}>
              <TouchableOpacity style={styles.keypadKey} onPress={() => handleKeyPress('7')}><Text style={[styles.keyText, { color: themeTextColor }]}>7</Text></TouchableOpacity>
              <TouchableOpacity style={styles.keypadKey} onPress={() => handleKeyPress('8')}><Text style={[styles.keyText, { color: themeTextColor }]}>8</Text></TouchableOpacity>
              <TouchableOpacity style={styles.keypadKey} onPress={() => handleKeyPress('9')}><Text style={[styles.keyText, { color: themeTextColor }]}>9</Text></TouchableOpacity>
            </View>
            <View style={styles.keypadRow}>
              <TouchableOpacity style={styles.keypadKey} onPress={() => handleKeyPress('.')}><Text style={[styles.keyText, { color: themeTextColor }]}>.</Text></TouchableOpacity>
              <TouchableOpacity style={styles.keypadKey} onPress={() => handleKeyPress('0')}><Text style={[styles.keyText, { color: themeTextColor }]}>0</Text></TouchableOpacity>
              <TouchableOpacity style={styles.keypadKey} onPress={() => handleKeyPress('backspace')}>
                <Ionicons name="backspace-outline" size={24} color={themeTextColor} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Action Trigger Button */}
        <TouchableOpacity
          style={[styles.payButton, amount === '' && styles.disabledPayButton]}
          onPress={handlePay}
          disabled={amount === ''}
        >
          <Text style={styles.payButtonText}>Pay ₹{amount || '0'}</Text>
          <Ionicons name="arrow-forward" size={18} color="#ffffff" style={{ marginLeft: 8 }} />
        </TouchableOpacity>

      </View>

      {/* Bank Account Selection Modal (Bottom Sheet) */}
      <Modal
        visible={showBankPicker}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowBankPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBgTap} onPress={() => setShowBankPicker(false)} />
          <View style={[styles.modalSheet, { backgroundColor: themeBg }]}>
            <View style={styles.sheetHeader}>
              <Text style={[styles.sheetTitle, { color: themeTextColor }]}>Choose account to pay</Text>
              <TouchableOpacity onPress={() => setShowBankPicker(false)}>
                <Ionicons name="close" size={24} color={themeTextColor} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={accounts}
              keyExtractor={(item, idx) => `modal-bank-${idx}`}
              renderItem={({ item }) => {
                const isSelected = selectedAccount?.bankName === item.bankName && selectedAccount?.accountNumber === item.accountNumber;
                return (
                  <TouchableOpacity
                    style={[styles.modalBankItem, { borderBottomColor: themeBorder }]}
                    onPress={() => {
                      setSelectedAccount(item);
                      setShowBankPicker(false);
                    }}
                  >
                    {renderLogo(item.bankName, 32)}
                    <View style={styles.modalBankDetails}>
                      <Text style={[styles.modalBankName, { color: themeTextColor }]}>{item.bankName}</Text>
                      <Text style={[styles.modalBankAcc, { color: themeSubText }]}>
                        {item.accountNumber} • Limit: ₹{(item.monthlyLimit || 10000) + (item.carryOverBalance || 0) - (item.monthlySpent || 0)} left
                      </Text>
                    </View>
                    {isSelected && <Ionicons name="checkmark" size={20} color="#1a73e8" />}
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </View>
      </Modal>

      {/* Custom Edit Banking Name Dialog Modal */}
      <Modal
        visible={showEditNameModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowEditNameModal(false)}
      >
        <View style={styles.editNameModalOverlay}>
          <View style={[styles.editNameCard, { backgroundColor: themeBg }]}>
            <Text style={[styles.editNameTitle, { color: themeTextColor }]}>Edit banking name</Text>
            <Text style={[styles.editNameSubtitle, { color: themeSubText }]}>
              Enter a custom display name for this recipient.
            </Text>
            
            <TextInput
              style={[
                styles.editNameInput, 
                { 
                  color: themeTextColor, 
                  borderColor: themeBorder,
                  backgroundColor: themeCardBg 
                }
              ]}
              value={tempEditName}
              onChangeText={setTempEditName}
              placeholder="Recipient name"
              placeholderTextColor={themeSubText}
              autoFocus={true}
              maxLength={40}
            />

            <View style={styles.editNameActionsRow}>
              <TouchableOpacity 
                style={styles.editNameCancelBtn} 
                onPress={() => setShowEditNameModal(false)}
              >
                <Text style={styles.editNameCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.editNameSaveBtn} 
                onPress={() => {
                  if (tempEditName.trim()) {
                    setEditableRecipientName(tempEditName.trim());
                  }
                  setShowEditNameModal(false);
                }}
              >
                <Text style={styles.editNameSaveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
    paddingVertical: 12,
  },
  backButton: {
    marginRight: 'auto',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 10,
  },
  recipientContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#7b1fa2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  payeeName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  verifiedText: {
    fontSize: 12,
    color: '#5f6368',
  },
  upiIdText: {
    fontSize: 12,
    color: '#5f6368',
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 15,
  },
  currencySymbol: {
    fontSize: 32,
    fontWeight: '600',
    marginRight: 4,
  },
  amountValueText: {
    fontSize: 48,
    fontWeight: '700',
  },
  cursor: {
    width: 2,
    height: 48,
    backgroundColor: '#1a73e8',
    marginLeft: 4,
  },
  noteContainer: {
    width: '70%',
    alignItems: 'center',
  },
  noteInput: {
    width: '100%',
    height: 40,
    borderRadius: 20,
    paddingHorizontal: 16,
    textAlign: 'center',
    fontSize: 14,
  },
  footerContainer: {
    borderTopWidth: 1,
    padding: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  bankSelectorBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
    marginBottom: 16,
    backgroundColor: '#ffffff',
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
  bankTextCol: {
    flex: 1,
    marginLeft: 12,
  },
  bankNameText: {
    fontSize: 13,
    fontWeight: '600',
  },
  balanceCheckText: {
    fontSize: 11,
    color: '#80868b',
    marginTop: 2,
  },
  keypadContainer: {
    marginBottom: 16,
    backgroundColor: '#ffffff',
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    height: 44,
    marginBottom: 8,
  },
  keypadKey: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyText: {
    fontSize: 22,
    fontWeight: '600',
  },
  payButton: {
    backgroundColor: '#1a73e8',
    height: 48,
    borderRadius: 24,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledPayButton: {
    backgroundColor: '#80868b',
    opacity: 0.5,
  },
  payButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalBgTap: {
    flex: 1,
  },
  modalSheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '60%',
    padding: 20,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  modalBankItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 0.5,
  },
  modalBankDetails: {
    flex: 1,
    marginLeft: 12,
  },
  modalBankName: {
    fontSize: 15,
    fontWeight: '600',
  },
  modalBankAcc: {
    fontSize: 12,
    marginTop: 2,
  },
  editNameModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  editNameCard: {
    width: '100%',
    maxWidth: 320,
    borderRadius: 28,
    padding: 24,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  editNameTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  editNameSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  editNameInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 24,
  },
  editNameActionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  editNameCancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
  },
  editNameCancelText: {
    color: '#0b57d0',
    fontSize: 14,
    fontWeight: '600',
  },
  editNameSaveBtn: {
    backgroundColor: '#0b57d0',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  editNameSaveText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});
