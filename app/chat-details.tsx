import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  useColorScheme,
  StatusBar,
  TextInput,
  ScrollView,
  Platform,
  Dimensions,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams, useFocusEffect, Stack } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

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

const RANDOM_AMOUNTS = [23, 87, 41, 15, 92, 56, 34, 78, 61, 19, 84, 47, 29, 73, 52, 95, 38, 66, 12, 89, 45, 71, 26, 98, 53, 37, 81, 64, 17, 49];

const BUSINESS_RANDOM_AMOUNTS = [299, 149, 350, 425, 199, 302, 550, 249, 899, 120, 499, 349, 175, 620, 210, 399, 105, 599, 280, 415, 150, 749, 230, 850, 195, 310, 450, 275, 699, 325];

interface Transaction {
  id: string;
  recipientName: string;
  recipientUpiId: string;
  amount: number;
  type: string;
  fromBankName?: string;
  toBankName?: string;
  note?: string;
  date: string;
}

interface CustomMessage {
  id: string;
  recipientUpiId: string;
  text: string;
  sender: 'user' | 'recipient';
  date: string;
}

type ChatItem = 
  | { type: 'transaction'; data: Transaction; date: Date }
  | { type: 'message'; data: CustomMessage; date: Date };

export default function ChatDetailsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const router = useRouter();
  const params = useLocalSearchParams();
  const scrollViewRef = useRef<ScrollView>(null);

  const recipientName = (params.recipientName as string) || 'Recipient';
  const recipientUpiId = (params.recipientUpiId as string) || 'recipient@okaxis';
  const recipientImage = params.recipientImage as string;
  const transactionType = (params.type as string) || 'person';

  const [typedText, setTypedText] = useState('');
  const [chatItems, setChatItems] = useState<ChatItem[]>([]);
  const [showMenu, setShowMenu] = useState(false);

  const [editableRecipientName, setEditableRecipientName] = useState(recipientName);
  const [showEditNameModal, setShowEditNameModal] = useState(false);
  const [tempEditName, setTempEditName] = useState(recipientName);

  useEffect(() => {
    if (recipientName) {
      setEditableRecipientName(recipientName);
      setTempEditName(recipientName);
    }
  }, [recipientName]);

  const themeBg = isDark ? '#121212' : '#ffffff';
  const themeTextColor = isDark ? '#ffffff' : '#202124';
  const themeSubText = isDark ? '#9aa0a6' : '#5f6368';
  const themeBorder = isDark ? '#3c4043' : '#dadce0';
  const themeCardBg = isDark ? '#202124' : '#ffffff';
  const themeInputBg = isDark ? '#303134' : '#edf2fa';

  // Helper to generate deterministic phone number ending in 1790
  const getPhoneNumber = (name: string) => {
    if (name.toLowerCase().includes('jannath')) {
      return '+91 ••••• •4139';
    }
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const digits = (Math.abs(hash) % 9000 + 1000).toString();
    return `+91 ••••• •${digits}`;
  };

  // Helper to generate banking name
  const getBankingName = (name: string) => {
    if (name.toLowerCase().includes('jannath')) {
      return 'JANNATH NISHA SHAHUL HAMEED';
    }
    return name.toUpperCase();
  };

  // Helper to format timestamps for headers
  const formatChatHeaderDate = (date: Date) => {
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    const tempYesterday = new Date();
    tempYesterday.setDate(now.getDate() - 1);
    const isYesterday = date.toDateString() === tempYesterday.toDateString();
    
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const minStr = minutes < 10 ? '0' + minutes : minutes;
    const timeStr = `${hours}:${minStr} ${ampm}`;
    
    if (isToday) {
      return timeStr;
    }
    if (isYesterday) {
      return 'Yesterday';
    }
    
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayName = days[date.getDay()];
    return `${dayName} ${timeStr}`;
  };

  // Format time inside transaction card (e.g. 4:28 pm)
  const formatCardTime = (dateStr: string) => {
    const date = new Date(dateStr);
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const minStr = minutes < 10 ? '0' + minutes : minutes;
    return `${hours}:${minStr} ${ampm}`;
  };

  // Load and merge transactions and custom messages
  const loadConversationData = useCallback(async () => {
    try {
      // 1. Load transactions
      const txStr = await AsyncStorage.getItem('transaction_history');
      let allTx: Transaction[] = [];
      if (txStr) {
        const parsed = JSON.parse(txStr);
        if (Array.isArray(parsed)) {
          allTx = parsed;
        }
      }

      let txList = allTx.filter(
        (t: Transaction) => 
          (t.recipientUpiId && t.recipientUpiId.toLowerCase() === recipientUpiId.toLowerCase()) || 
          (t.recipientName && t.recipientName.toLowerCase() === recipientName.toLowerCase())
      );

      // If no transactions exist, let's generate 1-3 random transactions!
      if (txList.length === 0) {
        const generated: Transaction[] = [];
        
        if (recipientName.toLowerCase().includes('jannath')) {
          // Force Jannath's mock transaction to match the screenshot
          const jannathDate = new Date();
          jannathDate.setHours(16); // 4 PM
          jannathDate.setMinutes(28); // 28 mins
          generated.push({
            id: 'mock-jannath-tx',
            recipientName: recipientName,
            recipientUpiId: recipientUpiId,
            amount: 40.00,
            type: 'person',
            fromBankName: 'HDFC Bank',
            date: jannathDate.toISOString()
          });
        } else {
          // General random generation
          const count = Math.floor(Math.random() * 3) + 1; // 1 to 3 transactions
          const dateOptions = [
            new Date(), // today
            new Date(Date.now() - 3600000 * 24), // yesterday
            new Date(Date.now() - 3600000 * 48), // 2 days ago
            new Date(Date.now() - 3600000 * 24 * 3), // 3 days ago
          ];
          dateOptions.sort(() => Math.random() - 0.5);

          for (let i = 0; i < count; i++) {
            const randomAmount = transactionType === 'business'
              ? BUSINESS_RANDOM_AMOUNTS[Math.floor(Math.random() * BUSINESS_RANDOM_AMOUNTS.length)]
              : RANDOM_AMOUNTS[Math.floor(Math.random() * RANDOM_AMOUNTS.length)];
            const d = dateOptions[i];
            d.setHours(Math.floor(Math.random() * 12) + 9);
            d.setMinutes(Math.floor(Math.random() * 60));

            generated.push({
              id: 'TXN_GEN_' + Date.now() + '_' + i + '_' + Math.floor(Math.random() * 100),
              recipientName: recipientName,
              recipientUpiId: recipientUpiId,
              amount: randomAmount,
              type: transactionType,
              fromBankName: 'HDFC Bank',
              date: d.toISOString()
            });
          }
        }

        // Sort generated ascending by date
        generated.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        // Append to global transaction history
        allTx.push(...generated);
        await AsyncStorage.setItem('transaction_history', JSON.stringify(allTx));
        
        txList = generated;
      }

      // 2. Load custom messages
      const msgStr = await AsyncStorage.getItem('chat_messages');
      let msgList: CustomMessage[] = [];
      if (msgStr) {
        const parsed = JSON.parse(msgStr);
        if (Array.isArray(parsed)) {
          msgList = parsed.filter((m: CustomMessage) => m.recipientUpiId === recipientUpiId);
        }
      }

      // Merge and sort
      const items: ChatItem[] = [
        ...txList.map(t => ({ type: 'transaction' as const, data: t, date: new Date(t.date) })),
        ...msgList.map(m => ({ type: 'message' as const, data: m, date: new Date(m.date) })),
      ];

      items.sort((a, b) => a.date.getTime() - b.date.getTime());
      setChatItems(items);

      // Scroll to bottom
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);

    } catch (err) {
      console.error('Failed to load conversation history:', err);
    }
  }, [recipientUpiId, recipientName]);

  useFocusEffect(
    useCallback(() => {
      loadConversationData();
    }, [loadConversationData])
  );

  // Send message
  const handleSendMessage = async () => {
    if (typedText.trim() === '') return;

    try {
      const newMsg: CustomMessage = {
        id: 'MSG_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
        recipientUpiId: recipientUpiId,
        text: typedText.trim(),
        sender: 'user',
        date: new Date().toISOString(),
      };

      const msgStr = await AsyncStorage.getItem('chat_messages');
      let allMsgs = [];
      if (msgStr) {
        allMsgs = JSON.parse(msgStr);
        if (!Array.isArray(allMsgs)) allMsgs = [];
      }
      allMsgs.push(newMsg);
      await AsyncStorage.setItem('chat_messages', JSON.stringify(allMsgs));

      setTypedText('');
      loadConversationData();

      // Mock a response after 1.5 seconds to feel dynamic!
      setTimeout(async () => {
        const replyMsg: CustomMessage = {
          id: 'MSG_REPLY_' + Date.now(),
          recipientUpiId: recipientUpiId,
          text: `Thanks for messaging. I will look into it.`,
          sender: 'recipient',
          date: new Date().toISOString(),
        };
        const updatedMsgStr = await AsyncStorage.getItem('chat_messages');
        let currentMsgs = [];
        if (updatedMsgStr) {
          currentMsgs = JSON.parse(updatedMsgStr);
          if (!Array.isArray(currentMsgs)) currentMsgs = [];
        }
        currentMsgs.push(replyMsg);
        await AsyncStorage.setItem('chat_messages', JSON.stringify(currentMsgs));
        loadConversationData();
      }, 1500);

    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const handlePayPress = () => {
    router.push({
      pathname: '/pay-amount',
      params: {
        recipientName: editableRecipientName,
        recipientUpiId,
        recipientImage,
        type: transactionType,
      },
    } as any);
  };

  const handleTxnCardPress = (tx: Transaction) => {
    router.push({
      pathname: '/payment-details',
      params: {
        id: tx.id,
        amount: tx.amount.toString(),
        recipientName: tx.recipientName,
        recipientUpiId: tx.recipientUpiId,
        recipientImage: recipientImage || '',
        date: tx.date,
        type: tx.type,
        fromBankName: tx.fromBankName || 'State Bank of India',
        note: tx.note || ''
      }
    } as any);
  };

  const hasImage = recipientImage && PERSON_IMAGE_MAP[recipientImage];
  const firstLetter = editableRecipientName.replace('Self: ', '').charAt(0).toUpperCase();

  const menuItems = [
    'Start new group',
    'Block this person',
    'Turn off messaging',
    'Report user',
    'Refresh',
    'Get help',
    'Send feedback'
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeBg }]} edges={['top', 'left', 'right']}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* TOP HEADER ROW */}
      <View style={[styles.topHeader, { borderBottomColor: themeBorder }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={themeTextColor} />
        </TouchableOpacity>

        <View style={[styles.headerAvatar, { backgroundColor: '#f4511e', overflow: 'hidden' }]}>
          {hasImage ? (
            <Image source={PERSON_IMAGE_MAP[recipientImage]} style={styles.avatarImg} />
          ) : (
            <Text style={styles.avatarInitials}>{firstLetter}</Text>
          )}
        </View>

        <TouchableOpacity 
          style={styles.headerDetails}
          activeOpacity={0.7}
          onPress={() => {
            setTempEditName(editableRecipientName);
            setShowEditNameModal(true);
          }}
        >
          <Text style={[styles.recipientTitle, { color: themeTextColor }]} numberOfLines={1}>
            {editableRecipientName}
          </Text>
          <Text style={styles.recipientPhone}>
            {transactionType === 'business' ? recipientUpiId : getPhoneNumber(editableRecipientName)}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setShowMenu(!showMenu)} style={styles.menuBtn}>
          <Ionicons name="ellipsis-vertical" size={24} color={themeTextColor} />
        </TouchableOpacity>
      </View>

      {/* FLOATING 3-DOTS MENU DROPDOWN */}
      {showMenu && (
        <>
          <TouchableOpacity 
            style={styles.menuBackdrop} 
            activeOpacity={1} 
            onPress={() => setShowMenu(false)}
          />
          <View style={[styles.dropdownMenu, { backgroundColor: themeCardBg, borderColor: themeBorder }]}>
            {menuItems.map((item, idx) => (
              <TouchableOpacity 
                key={idx} 
                style={styles.dropdownItem}
                onPress={() => {
                  setShowMenu(false);
                  alert(`${item} triggered`);
                }}
              >
                <Text style={[styles.dropdownText, { color: themeTextColor }]}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

      {/* CHAT / TRANSACTION SCROLL AREA */}
      <ScrollView 
        ref={scrollViewRef}
        style={styles.chatScroll}
        contentContainerStyle={styles.chatContainer}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {/* CENTER-ALIGNED PROFILE DETAILS HEADER */}
        <View style={styles.profileDetailsHeader}>
          <View style={[styles.largeAvatarCircle, { backgroundColor: '#f4511e', overflow: 'hidden' }]}>
            {hasImage ? (
              <Image source={PERSON_IMAGE_MAP[recipientImage]} style={styles.largeAvatarImg} />
            ) : (
              <Text style={styles.largeAvatarText}>{firstLetter}</Text>
            )}
          </View>
          
          <TouchableOpacity 
            style={{ alignItems: 'center' }}
            activeOpacity={0.7}
            onPress={() => {
              setTempEditName(editableRecipientName);
              setShowEditNameModal(true);
            }}
          >
            <Text style={[styles.largeProfileName, { color: themeTextColor }]}>
              {editableRecipientName}
            </Text>
            
            <View style={styles.bankingNameRow}>
              <Ionicons name="shield-checkmark" size={15} color="#0f9d58" style={{ marginRight: 6 }} />
              <Text style={[styles.bankingNameText, { color: themeTextColor }]}>
                Banking name: {getBankingName(editableRecipientName)}
              </Text>
            </View>

            <Text style={[styles.profilePhoneText, { color: themeTextColor }]}>
              {transactionType === 'business' ? recipientUpiId : getPhoneNumber(editableRecipientName)}
            </Text>
          </TouchableOpacity>

          <Text style={[styles.joinedDateText, { color: themeSubText }]}>
            Joined October 2025
          </Text>
        </View>

        {/* CHAT CHRONOLOGICAL MAPPING */}
        {chatItems.map((item, index) => {
          const showDateHeader = 
            index === 0 || 
            chatItems[index - 1].date.toDateString() !== item.date.toDateString();

          return (
            <View key={item.data.id} style={styles.itemWrapper}>
              {showDateHeader && (
                <View style={styles.dateHeaderRow}>
                  <View style={[styles.dateLine, { backgroundColor: themeBorder }]} />
                  <Text style={[styles.dateHeaderText, { color: themeSubText }]}>
                    {formatChatHeaderDate(item.date)}
                  </Text>
                  <View style={[styles.dateLine, { backgroundColor: themeBorder }]} />
                </View>
              )}

              {item.type === 'transaction' ? (
                // RIGHT-ALIGNED TRANSACTION GROUP (Payment Card + Scratch Cards Card)
                <View style={styles.txCardAlignRight}>
                  {/* MAIN PAYMENT CARD */}
                  <TouchableOpacity 
                    style={[styles.paymentCard, { backgroundColor: themeCardBg }]}
                    onPress={() => handleTxnCardPress(item.data as Transaction)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.cardTitle, { color: themeTextColor }]}>
                      Payment to {recipientName.split(' ')[0]}
                    </Text>
                    <Text style={[styles.cardAmount, { color: themeTextColor }]}>
                      ₹{item.data.amount.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                    </Text>
                    
                    <View style={[styles.cardDivider, { backgroundColor: themeBorder }]} />

                    <View style={styles.cardStatusRow}>
                      <Ionicons name="checkmark-circle" size={16} color="#0f9d58" style={styles.statusIcon} />
                      <Text style={[styles.statusText, { color: themeTextColor }]}>Paid • {formatCardTime(item.data.date)}</Text>
                      <Ionicons name="chevron-forward" size={14} color="#5f6368" style={{ marginLeft: 'auto' }} />
                    </View>
                  </TouchableOpacity>

                  {/* REWARDS CARD (Only shown on every 3rd transaction) */}
                  {(() => {
                    const allTxItems = chatItems.filter(ci => ci.type === 'transaction');
                    const txIndex = allTxItems.findIndex(ci => ci.data.id === item.data.id);
                    if (txIndex !== -1 && txIndex % 3 === 0) {
                      return (
                        <View style={[styles.rewardsCard, { backgroundColor: themeCardBg }]}>
                          <Text style={styles.rewardsTitle}>You earned 2 rewards</Text>
                          
                          <View style={styles.rewardItemRow}>
                            <View style={[styles.scratchCardIcon, { overflow: 'hidden' }]}>
                              <Image 
                                source={require('@/assets/images/scratch_card.png')} 
                                style={{ width: '150%', height: '150%', transform: [{ scale: 1.45 }] }} 
                                resizeMode="cover"
                              />
                            </View>
                            <Text style={[styles.rewardItemText, { color: themeTextColor }]}>Scratch card</Text>
                            <Ionicons name="chevron-forward" size={14} color="#5f6368" />
                          </View>

                          <View style={[styles.cardDivider, { backgroundColor: themeBorder, marginVertical: 8 }]} />

                          <View style={styles.rewardItemRow}>
                            <View style={[styles.scratchCardIcon, { overflow: 'hidden' }]}>
                              <Image 
                                source={require('@/assets/images/scratch_card.png')} 
                                style={{ width: '150%', height: '150%', transform: [{ scale: 1.45 }] }} 
                                resizeMode="cover"
                              />
                            </View>
                            <Text style={[styles.rewardItemText, { color: themeTextColor }]}>Scratch card</Text>
                            <Ionicons name="chevron-forward" size={14} color="#5f6368" />
                          </View>
                        </View>
                      );
                    }
                    return null;
                  })()}
                </View>
              ) : (
                // CHAT BUBBLE
                <View style={[
                  styles.bubbleContainer, 
                  item.data.sender === 'user' ? styles.bubbleRightAlign : styles.bubbleLeftAlign
                ]}>
                  <View style={[
                    styles.chatBubble, 
                    item.data.sender === 'user' 
                      ? [styles.bubbleUser, { backgroundColor: '#1a73e8' }]
                      : [styles.bubbleRecipient, { backgroundColor: themeInputBg }]
                  ]}>
                    <Text style={[
                      styles.bubbleText, 
                      { color: item.data.sender === 'user' ? '#ffffff' : themeTextColor }
                    ]}>
                      {item.data.text}
                    </Text>
                    <Text style={[
                      styles.bubbleTime, 
                      { color: item.data.sender === 'user' ? '#ffffffb3' : themeSubText }
                    ]}>
                      {formatCardTime(item.data.date)}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>

      {/* BOTTOM ACTIONS BAR */}
      <View style={[styles.bottomBar, { borderTopColor: themeBorder, backgroundColor: themeBg }]}>
        {/* Left corner "Pay" Button */}
        <TouchableOpacity 
          style={[styles.payBtnWrapper, { backgroundColor: isDark ? '#1a73e8' : '#0b57d0' }]} 
          onPress={handlePayPress}
        >
          <Text style={styles.payBtnText}>Pay</Text>
        </TouchableOpacity>

        {/* Right side input field with inner send icon */}
        <View style={[styles.messageInputWrapper, { backgroundColor: themeInputBg }]}>
          <TextInput
            style={[styles.messageInput, { color: themeTextColor }]}
            placeholder="Message..."
            placeholderTextColor={themeSubText}
            value={typedText}
            onChangeText={setTypedText}
            onSubmitEditing={handleSendMessage}
          />
          <TouchableOpacity 
            onPress={handleSendMessage} 
            style={styles.sendIconBtn}
            disabled={typedText.trim().length === 0}
          >
            <Ionicons 
              name="send" 
              size={18} 
              color={typedText.trim().length > 0 ? (isDark ? '#8ab4f8' : '#0b57d0') : (isDark ? '#5f6368' : '#c4c7c5')} 
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Custom Edit Display Name Modal */}
      <Modal
        visible={showEditNameModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowEditNameModal(false)}
      >
        <View style={styles.editNameModalOverlay}>
          <View style={[styles.editNameCard, { backgroundColor: themeBg }]}>
            <Text style={[styles.editNameTitle, { color: themeTextColor }]}>Edit display name</Text>
            <Text style={[styles.editNameSubtitle, { color: themeSubText }]}>
              Enter a custom display name for this contact.
            </Text>
            
            <TextInput
              style={[
                styles.editNameInput, 
                { 
                  color: themeTextColor, 
                  borderColor: themeBorder,
                  backgroundColor: themeInputBg 
                }
              ]}
              value={tempEditName}
              onChangeText={setTempEditName}
              placeholder="Display name"
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
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
  },
  backBtn: {
    marginRight: 12,
    padding: 4,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  avatarInitials: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  recipientTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  recipientPhone: {
    fontSize: 12,
    color: '#80868b',
    marginTop: 2,
  },
  menuBtn: {
    padding: 4,
  },
  dropdownMenu: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 100 : 60,
    right: 16,
    borderRadius: 8,
    borderWidth: 1,
    width: 180,
    zIndex: 1000,
    ...Platform.select({
      ios: {
        shadowColor: '#0000001d',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dropdownText: {
    fontSize: 14,
    fontWeight: '500',
  },
  chatScroll: {
    flex: 1,
  },
  chatContainer: {
    padding: 16,
    paddingBottom: 24,
  },
  profileDetailsHeader: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  largeAvatarCircle: {
    width: 70,
    height: 80,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  largeAvatarImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  largeAvatarText: {
    color: '#ffffff',
    fontSize: 34,
    fontWeight: 'bold',
  },
  largeProfileName: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  bankingNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    paddingHorizontal: 12,
  },
  bankingNameText: {
    fontSize: 13,
    fontWeight: '600',
  },
  profilePhoneText: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 4,
  },
  joinedDateText: {
    fontSize: 12,
    marginTop: 2,
  },
  itemWrapper: {
    marginBottom: 16,
  },
  dateHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 18,
  },
  dateLine: {
    flex: 1,
    height: 1,
  },
  dateHeaderText: {
    paddingHorizontal: 12,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  txCardAlignRight: {
    alignSelf: 'flex-end',
    width: width * 0.64,
  },
  paymentCard: {
    borderWidth: 0,
    borderRadius: 36,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  cardAmount: {
    fontSize: 36,
    fontWeight: '700',
    marginVertical: 6,
  },
  cardDivider: {
    height: 1,
    marginVertical: 12,
  },
  cardStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  statusIcon: {
    marginRight: 6,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
  },
  rewardsCard: {
    borderWidth: 0,
    borderRadius: 36,
    padding: 14,
    marginTop: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  rewardsTitle: {
    fontSize: 12,
    color: '#5f6368',
    fontWeight: '600',
    marginBottom: 12,
  },
  rewardItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scratchCardIcon: {
    width: 38,
    height: 36,
    borderRadius: 8,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rewardItemText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 12,
    flex: 1,
  },
  bubbleContainer: {
    flexDirection: 'row',
    width: '100%',
    marginVertical: 2,
  },
  bubbleRightAlign: {
    justifyContent: 'flex-end',
  },
  bubbleLeftAlign: {
    justifyContent: 'flex-start',
  },
  chatBubble: {
    maxWidth: width * 0.75,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  bubbleUser: {
    borderBottomRightRadius: 4,
  },
  bubbleRecipient: {
    borderBottomLeftRadius: 4,
  },
  bubbleText: {
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '400',
  },
  bubbleTime: {
    fontSize: 9,
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 0.5,
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
  },
  payBtnWrapper: {
    borderRadius: 24,
    paddingHorizontal: 28,
    paddingVertical: 12,
    height: 48,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  payBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  messageInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 24,
    paddingHorizontal: 16,
    height: 48,
  },
  messageInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 0,
  },
  sendIconBtn: {
    paddingLeft: 8,
  },
  menuBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
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
