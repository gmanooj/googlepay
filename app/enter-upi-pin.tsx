import { getApiBaseUrl } from '@/constants/config';
import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  useColorScheme,
  StatusBar,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import Svg, { Path } from 'react-native-svg';
import LottieView from 'lottie-react-native';
import { useAudioPlayer } from 'expo-audio';

const API_HOST = getApiBaseUrl();

function UpiLogo() {
  return (
    <Svg viewBox="0 0 1024 466" style={{ width: 70, height: 32 }}>
      <Path fill="#3d3d3c" d="M98.1 340.7h6.3l-5.9 24.5c-.9 3.6-.7 6.4.5 8.2 1.2 1.8 3.4 2.7 6.7 2.7 3.2 0 5.9-.9 8-2.7 2.1-1.8 3.5-4.6 4.4-8.2l5.9-24.5h6.4l-6 25.1c-1.3 5.4-3.6 9.5-7 12.2-3.3 2.7-7.7 4.1-13.1 4.1-5.4 0-9.1-1.3-11.1-4s-2.4-6.8-1.1-12.2l6-25.2zm31.4 40.3 10-41.9 19 24.6c.5.7 1 1.4 1.5 2.2.5.8 1 1.7 1.6 2.7l6.7-27.9h5.9l-10 41.8-19.4-25.1-1.5-2.1c-.5-.8-.9-1.5-1.2-2.4l-6.7 28h-5.9zm44.2 0 9.6-40.3h6.4l-9.6 40.3h-6.4zm15.5 0 9.6-40.3h21.9l-1.3 5.6h-15.5l-2.4 10H217l-1.4 5.7h-15.5l-4.5 18.9h-6.4zm29 0 9.6-40.3h6.4l-9.6 40.3h-6.4zm15.5 0 9.6-40.3h21.9l-1.3 5.6h-15.5l-2.4 10.1h15.5l-1.4 5.7h-15.5l-3.1 13H257l-1.4 5.9h-21.9zm29.3 0 9.6-40.3h8.6c5.6 0 9.5.3 11.6.9 2.1.6 3.9 1.5 5.3 2.9C303 361 304.2 363.3 304.7 366c.5 2.8.3 6-.5 9.5-.9 3.6-2.2 6.7-4 9.5-1.8 2.8-4.1 5-6.8 6.8-2 1.4-4.2 2.3-6.6 2.9-2.3.6-5.8.9-10.4.9H263zm7.8-6h5.4c2.9 0 5.2-.2 6.8-.6 1.6-.4 3-1.1 4.3-2 1.8-1.3 3.3-2.9 4.5-4.9 1.2-1.9 2.1-4.2 2.7-6.8.6-2.6.8-4.8.5-6.7-.3-1.9-1-3.6-2.2-4.9-.9-1-2-1.6-3.5-2-1.5-.4-3.8-.6-7.1-.6h-4.6l-6.8 28.5zm59.7-12.1-4.3 18.1h-6l9.6-40.3h9.7c2.9 0 4.9.2 6.2.5 1.3.3 2.3.8 3.1 1.6 1 .9 1.7 2.2 2 3.8.3 1.6.2 3.3-.2 5.2-.5 1.9-1.2 3.7-2.3 5.3-1.1 1.6-2.4 2.9-3.8 3.8-1.2.7-2.5 1.3-3.9 1.6-1.4.3-3.6.5-6.4.5h-3.7zm1.7-5.4h1.6c3.5 0 6-.4 7.4-1.2 1.4-.8 2.3-2.2 2.8-4.2.5-2.1.2-3.7-.8-4.5-1.1-.9-3.3-1.3-6.6-1.3H335l-2.8 11.2zm40.1 23.5-2-10.4h-15.6l-7 10.4H341l29-41.9 9 41.9h-6.7zm-13.8-15.9h10.9l-1.8-9.2c-.1-.6-.2-1.3-.2-2-.1-.8-.1-1.6-.1-2.5-.4.9-.8 1.7-1.3 2.5-.4.8-.8 1.5-1.2 2.1l-6.3 9.1zm29.7 15.9 4.4-18.4-8-21.8h6.7l5 13.7c.1.4.2.8.4 1.4.2.6.3 1.2.5 1.8l1.2-1.8c.4-.6.8-1.1 1.2-1.6l11.7-13.5h6.4L399 362.5l-4.4 18.4h-6.4zm60.9-19.9c0-.3.1-1.2.3-2.6.1-1.2.2-2.1.3-2.9-.4.9-.8 1.8-1.3 2.8-.5.9-1.1 1.9-1.8 2.8l-15.4 21.5-5-21.9c-.2-.9-.4-1.8-.5-2.6-.1-.8-.2-1.7-.2-2.5-.2.8-.5 1.7-.8 2.7-.3.9-.7 1.9-1.2 2.9l-9 19.8h-5.9l19.3-42 5.5 25.4c.1.4.2 1.1.3 2 .1.9.3 2.1.5 3.5.7-1.2 1.6-2.6 2.8-4.4.3-.5.6-.8.7-1.1l17.4-25.4-.6 42h-5.9l.5-20zm10.6 19.9 9.6-40.3h21.9l-1.3 5.6h-15.5l-2.4 10.1h15.5l-1.4 5.7h-15.5l-3.1 13H483l-1.4 5.9h-21.9zm29.2 0 10-41.9 19 24.6c.5.7 1 1.4 1.5 2.2.5.8 1 1.7 1.6 2.7l6.7-27.9h5.9l-10 41.8-19.4-25.1-1.5-2.1c-.5-.8-.9-1.5-1.2-2.4l-6.7 28h-5.9zm65.1-34.8-8.3 34.7h-6.4l8.3-34.7h-10.4l1.3-5.6h27.2l-1.3 5.6H554zm6.7 26.7 5.7-2.4c.1 1.8.6 3.2 1.7 4.1 1.1.9 2.6 1.4 4.6 1.4 1.9 0 3.5-.5 4.9-1.6 1.4-1.1 2.3-2.5 2.7-4.3.6-2.4-.8-4.5-4.2-6.3-.5-.3-.8-.5-1.1-.6-3.8-2.2-6.2-4.1-7.2-5.9-1-1.8-1.2-3.9-.6-6.4.8-3.3 2.5-5.9 5.2-8 2.7-2 5.7-3.1 9.3-3.1 2.9 0 5.2.6 6.9 1.7 1.7 1.1 2.6 2.8 2.9 4.9l-5.6 2.6c-.5-1.3-1.1-2.2-1.9-2.8-.8-.6-1.8-.9-3-.9-1.7 0-3.2.5-4.4 1.4-1.2.9-2 2.1-2.4 3.7-.6 2.4 1.1 4.7 5 6.8.3.2.5.3.7.4 3.4 1.8 5.7 3.6 6.7 5.4 1 1.8 1.2 3.9.6 6.6-.9 3.8-2.8 6.8-5.7 9.1-2.9 2.2-6.3 3.4-10.3 3.4-3.3 0-5.9-.8-7.7-2.4-2-1.6-2.9-3.9-2.8-6.8zm47.1 8.1 9.6-40.3h6.4l-9.6 40.3h-6.4zm15.6 0 10-41.9 19 24.6c.5.7 1 1.4 1.5 2.2.5.8 1 1.7 1.6 2.7l6.7-27.9h5.9l-10 41.8-19.4-25.1-1.5-2.1c-.5-.8-.9-1.5-1.2-2.4l-6.7 28h-5.9zm65.1-34.8-8.3 34.7h-6.4l8.3-34.7h-10.4l1.3-5.6h27.2l-1.3 5.6h-10.4zm6.9 34.8 9.6-40.3h22l-1.3 5.6h-15.5l-2.4 10.1h15.5l-1.4 5.7h-15.5l-3.1 13h15.5l-1.4 5.9h-22zm39.5-18.1-4.3 18h-6l9.6-40.3h8.9c2.6 0 4.6.2 5.9.5 1.4.3 2.5.9 3.3 1.7 1 1 1.6 2.2 1.9 3.8.3 1.5.2 3.2-.2 5.1-.8 3.2-2.1 5.8-4.1 7.6-2 1.8-4.5 2.9-7.5 3.3l9.1 18.3h-7.2l-8.7-18h-.7zm1.6-5.1h1.2c3.4 0 5.7-.4 7-1.2 1.3-.8 2.2-2.2 2.7-4.3.5-2.2.3-3.8-.7-4.7-1-.9-3.1-1.4-6.3-1.4h-1.2l-2.7 11.6zm18.9 23.2 9.6-40.3h21.9l-1.3 5.6h-15.5l-2.4 10h15.5l-1.4 5.7h-15.5l-4.5 18.9h-6.4zm52.8 0-2-10.4h-15.6l-7 10.4h-6.7l29-41.9 9 41.9h-6.7zm-13.9-15.9h10.9l-1.8-9.2c-.1-.6-.2-1.3-.2-2-.1-.8-.1-1.6-.1-2.5-.4.9-.8 1.7-1.3 2.5-.4.8-.8 1.5-1.2 2.1l-6.3 9.1zm62.2-14.6c-1.4-1.6-3.1-2.8-4.9-3.5-1.8-.8-3.8-1.2-6.1-1.2-4.3 0-8.1 1.4-11.5 4.2-3.4 2.8-5.6 6.5-6.7 11-1 4.3-.6 7.9 1.4 10.8 1.9 2.8 4.9 4.2 8.9 4.2 2.3 0 4.6-.4 6.9-1.3 2.3-.8 4.6-2.1 7-3.8l-1.8 7.4c-2 1.3-4.1 2.2-6.3 2.8-2.2.6-4.4.9-6.8.9-3 0-5.7-.5-8-1.5s-4.2-2.5-5.7-4.5c-1.5-1.9-2.4-4.2-2.8-6.8-.4-2.6-.3-5.4.5-8.4.7-3 1.9-5.7 3.5-8.3 1.6-2.6 3.7-4.9 6.1-6.8 2.4-2 5-3.5 7.8-4.5s5.6-1.5 8.5-1.5c2.3 0 4.4.3 6.4 1 1.9.7 3.7 1.7 5.3 3.1l-1.7 6.7zm.6 30.5 9.6-40.3h21.9l-1.3 5.6h-15.5l-2.4 10.1h15.5l-1.4 5.7H868l-3.1 13h15.5L879 381h-21.9z" />
      <Path fill="#70706e" d="M740.7 305.6h-43.9l61-220.3h43.9l-61 220.3zM717.9 92.2c-3-4.2-7.7-6.3-14.1-6.3H462.6l-11.9 43.2h219.4l-12.8 46.1H481.8v-.1h-43.9l-36.4 131.5h43.9l24.4-88.2h197.3c6.2 0 12-2.1 17.4-6.3 5.4-4.2 9-9.4 10.7-15.6l24.4-88.2c1.9-6.6 1.3-11.9-1.7-16.1zm-342 199.6c-2.4 8.7-10.4 14.8-19.4 14.8H130.2c-6.2 0-10.8-2.1-13.8-6.3-3-4.2-3.7-9.4-1.9-15.6l55.2-198.8h43.9l-49.3 177.6h175.6l49.3-177.6h43.9l-57.2 205.9z" />
      <Path fill="#098041" d="M877.5 85.7 933 196.1 816.3 306.5z" />
      <Path fill="#e97626" d="M838.5 85.7 894 196.1 777.2 306.5z" />
    </Svg>
  );
}

export default function EnterUpiPinScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const bankName = (params.bankName as string) || 'Bank Account';
  const amount = params.amount as string;
  const recipientName = params.recipientName as string;
  const recipientUpiId = params.recipientUpiId as string;
  const toBankName = params.toBankName as string;
  const transactionType = params.type as string;
  const note = params.note as string;

  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [txnId, setTxnId] = useState('');
  const [txnTime, setTxnTime] = useState('');

  // Lottie animation ref
  const lottieRef = useRef<LottieView>(null);

  // Audio Player for GPay Success Sound
  const audioPlayer = useAudioPlayer(require('../assets/mp3/gpay.mp3'));

  useEffect(() => {
    async function loadPhone() {
      try {
        const stored = await AsyncStorage.getItem('user_phone');
        if (stored) setPhone(stored);
      } catch (err) {
        console.error('Error loading phone:', err);
      }
    }
    loadPhone();
  }, []);

  useEffect(() => {
    if (success) {
      audioPlayer.play();
      // Set dynamic date-time and transaction ID
      setTxnTime(formatDate(new Date()));
      setTxnId(generateTxnId());
      // Play lottie after a short delay to ensure it's mounted
      setTimeout(() => {
        lottieRef.current?.play();
      }, 100);
    }
  }, [success, audioPlayer]);

  const formatDate = (date: Date) => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // 0 should be 12
    return `${day} ${month} ${year}, ${hours}:${minutes} ${ampm}`;
  };

  const generateTxnId = () => {
    return Math.floor(400000000000 + Math.random() * 600000000000).toString();
  };

  const handleKeyPress = (val: string) => {
    if (val === 'backspace') {
      setPin(prev => prev.slice(0, -1));
    } else {
      if (pin.length >= 6) return;
      setPin(prev => prev + val);
    }
  };

  const handleCheckClick = async () => {
    if (pin.length < 6) {
      Alert.alert('Incomplete PIN', 'Please enter your 6-digit PIN.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      const response = await fetch(`${API_HOST}/api/execute-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone,
          fromBankName: bankName,
          toBankName,
          recipientUpiId,
          amount: parseFloat(amount),
          pin,
          type: transactionType,
          note,
        }),
      });

      const data = await response.json();
      if (data.success) {
        await AsyncStorage.setItem('bank_accounts', JSON.stringify(data.bankAccounts));
        
        // Log transaction to history in AsyncStorage
        try {
          const existingHistoryStr = await AsyncStorage.getItem('transaction_history');
          let history = [];
          if (existingHistoryStr) {
            history = JSON.parse(existingHistoryStr);
          }
          if (!Array.isArray(history)) {
            history = [];
          }
          const newTx = {
            id: 'TXN_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
            recipientName: transactionType === 'self_transfer' ? `Self: ${toBankName || 'Bank Account'}` : recipientName,
            recipientUpiId: recipientUpiId,
            amount: parseFloat(amount),
            type: transactionType,
            fromBankName: bankName,
            toBankName: toBankName,
            note: note,
            date: new Date().toISOString()
          };
          history.unshift(newTx);
          await AsyncStorage.setItem('transaction_history', JSON.stringify(history));
        } catch (txErr) {
          console.error('Failed to save transaction to history:', txErr);
        }
        
        // Show settlement loading state first
        setLoading(false);
        setIsProcessing(true);
        setTimeout(() => {
          setIsProcessing(false);
          setSuccess(true);
        }, 1800); // 1.8 seconds loading screen
      } else {
        setErrorMsg(data.message || 'Transaction failed.');
        setPin('');
      }
    } catch (err) {
      console.error('Payment error:', err);
      Alert.alert('Network Error', 'Payment request failed. Please check connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoHome = () => {
    router.replace('/(tabs)');
  };

  const getMaskedAccount = () => {
    if (!recipientUpiId) return 'XXX •• 9876';
    const cleanUpi = recipientUpiId.split('@')[0];
    const num = cleanUpi.replace(/[^0-9]/g, '');
    const lastDigits = num.length >= 4 ? num.slice(-4) : '9876';
    return `XXX •• ${lastDigits}`;
  };

  // 1. Loading/Processing settlement State (Light theme GPay style)
  if (isProcessing) {
    return (
      <SafeAreaView style={styles.processingContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <View style={styles.processingContent}>
          <ActivityIndicator size="large" color="#1a73e8" style={styles.processingSpinner} />
          <Text style={styles.processingTitle}>Paying {transactionType === 'self_transfer' ? 'Self Account' : recipientName}...</Text>
          <Text style={styles.processingAmount}>₹{parseFloat(amount).toFixed(2)}</Text>
          <Text style={styles.processingSubText}>Securing transaction with your bank. Please do not close the app.</Text>
        </View>
      </SafeAreaView>
    );
  }

  // 2. Success State (Light Theme matching GPay screenshot)
  if (success) {
    return (
      <SafeAreaView style={styles.successContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <View style={styles.successContent}>
          
          {/* GPay Success Lottie animation */}
          <LottieView
            ref={lottieRef}
            source={require('../assets/animations/gpay-success-lottie.json')}
            style={styles.successLottie}
            autoPlay
            loop={false}
            resizeMode="contain"
          />

          {/* Amount and recipient name */}
          <Text style={styles.successAmount}>₹{parseFloat(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
          <Text style={styles.successDetails}>
            {transactionType === 'self_transfer'
              ? `Transferred to ${toBankName}`
              : `Paid to ${recipientName}`
            }
          </Text>
          <Text style={styles.successSourceBank}>{bankName} {getMaskedAccount()}</Text>

          {note ? <Text style={styles.successNote}>&quot;{note}&quot;</Text> : null}

          {/* Date, Time, and Transaction ID Section */}
          <View style={styles.metadataSection}>
            <Text style={styles.metadataText}>{txnTime}</Text>
            <Text style={styles.metadataText}>UPI transaction ID: {txnId}</Text>
          </View>

          <TouchableOpacity style={styles.doneBtn} onPress={handleGoHome}>
            <Text style={styles.doneBtnText}>Done</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffffff" />
      
      {/* Top Banner Row */}
      <View style={styles.bankBanner}>
        <View style={styles.bannerLeft}>
          <Text style={styles.bannerBankName}>{bankName}</Text>
          <Text style={styles.bannerMask}>{getMaskedAccount()}</Text>
        </View>
        <View style={styles.bannerRight}>
          <UpiLogo />
        </View>
      </View>

      {/* Check Balance dropdown bar */}
      <View style={styles.checkBalanceBar}>
        <Text style={styles.checkBalanceText}>Check Balance</Text>
        <Ionicons name="chevron-down" size={14} color="#888888" style={{ marginLeft: 6 }} />
      </View>

      {/* Verification Content */}
      <View style={styles.content}>
        
        <Text style={styles.pinTitle}>ENTER 6-DIGIT UPI PIN</Text>

        {/* 6 Lines Spaced Pin Input mask */}
        <View style={styles.linesRow}>
          {[0, 1, 2, 3, 4, 5].map(idx => {
            const hasDigit = pin.length > idx;
            return (
              <View key={`line-${idx}`} style={styles.lineField}>
                <Text style={styles.lineValueDot}>
                  {hasDigit ? '•' : ' '}
                </Text>
                <View style={[styles.lineUnderbar, hasDigit && styles.activeLineUnderbar]} />
              </View>
            );
          })}
        </View>

        {/* Orange Alert Exclamation Warning Box */}
        <View style={styles.alertWarningBox}>
          <View style={styles.alertIconCircle}>
            <Text style={styles.alertIconText}>!</Text>
          </View>
          <Text style={styles.alertText}>
            UPI PIN will keep your account secure from unauthorized access. Do not share this PIN with anyone.
          </Text>
        </View>

        {errorMsg !== '' && (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle-outline" size={16} color="#ea4335" style={{ marginRight: 6 }} />
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>
        )}

        {loading && <ActivityIndicator size="large" color="#1a73e8" style={{ marginTop: 20 }} />}

      </View>

      {/* UPI Pin Secure White/Grey Keyboard */}
      <View style={styles.keypadWrapper}>
        <View style={styles.keypadRow}>
          <TouchableOpacity style={styles.keyButton} onPress={() => handleKeyPress('1')}><Text style={styles.keyText}>1</Text></TouchableOpacity>
          <TouchableOpacity style={styles.keyButton} onPress={() => handleKeyPress('2')}><Text style={styles.keyText}>2</Text></TouchableOpacity>
          <TouchableOpacity style={styles.keyButton} onPress={() => handleKeyPress('3')}><Text style={styles.keyText}>3</Text></TouchableOpacity>
        </View>
        <View style={styles.keypadRow}>
          <TouchableOpacity style={styles.keyButton} onPress={() => handleKeyPress('4')}><Text style={styles.keyText}>4</Text></TouchableOpacity>
          <TouchableOpacity style={styles.keyButton} onPress={() => handleKeyPress('5')}><Text style={styles.keyText}>5</Text></TouchableOpacity>
          <TouchableOpacity style={styles.keyButton} onPress={() => handleKeyPress('6')}><Text style={styles.keyText}>6</Text></TouchableOpacity>
        </View>
        <View style={styles.keypadRow}>
          <TouchableOpacity style={styles.keyButton} onPress={() => handleKeyPress('7')}><Text style={styles.keyText}>7</Text></TouchableOpacity>
          <TouchableOpacity style={styles.keyButton} onPress={() => handleKeyPress('8')}><Text style={styles.keyText}>8</Text></TouchableOpacity>
          <TouchableOpacity style={styles.keyButton} onPress={() => handleKeyPress('9')}><Text style={styles.keyText}>9</Text></TouchableOpacity>
        </View>
        <View style={styles.keypadRow}>
          <TouchableOpacity 
            style={styles.keyButton} 
            onPress={() => handleKeyPress('backspace')}
          >
            <Ionicons name="backspace-outline" size={24} color="#3d3d3c" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.keyButton} onPress={() => handleKeyPress('0')}><Text style={styles.keyText}>0</Text></TouchableOpacity>
          <TouchableOpacity 
            style={[styles.checkmarkBtn, pin.length < 6 && styles.disabledCheckBtn]} 
            onPress={handleCheckClick}
            disabled={pin.length < 6}
          >
            <Ionicons name="checkmark" size={26} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffffff',
  },
  bankBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: '#ffffff',
  },
  bannerLeft: {
    flex: 1,
  },
  bannerBankName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#3d3d3c',
  },
  bannerMask: {
    fontSize: 13,
    color: '#70706e',
    marginTop: 2,
    letterSpacing: 0.5,
  },
  bannerRight: {
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  checkBalanceBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#ffffff',
  },
  checkBalanceText: {
    fontSize: 12,
    color: '#888888',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 36,
    paddingHorizontal: 20,
  },
  pinTitle: {
    color: '#5f6368',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 30,
  },
  linesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '85%',
    marginBottom: 36,
  },
  lineField: {
    width: 32,
    alignItems: 'center',
  },
  lineValueDot: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#171717',
    height: 32,
    lineHeight: 32,
  },
  lineUnderbar: {
    width: '100%',
    height: 1.5,
    backgroundColor: '#b0b0b0',
    marginTop: 4,
  },
  activeLineUnderbar: {
    backgroundColor: '#1a73e8',
    height: 2,
  },
  alertWarningBox: {
    flexDirection: 'row',
    backgroundColor: '#fef7e0',
    borderWidth: 1,
    borderColor: '#ffe8a1',
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  alertIconCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#f89406',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  alertIconText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 13,
  },
  alertText: {
    flex: 1,
    fontSize: 12,
    color: '#6c757d',
    lineHeight: 16,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#fce8e6',
    marginTop: 10,
    width: '100%',
  },
  errorText: {
    color: '#c5221f',
    fontSize: 13,
    flex: 1,
  },
  keypadWrapper: {
    backgroundColor: '#ffffffff',
    paddingVertical: 14,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    height: 54,
    marginBottom: 4,
  },
  keyButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkBtn: {
    backgroundColor: '#0f4da8',
    borderRadius: 24,
    width: 48,
    height: 48,
    maxHeight: 48,
    maxWidth: 48,
    marginRight: 24,
    marginLeft: 24,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  disabledCheckBtn: {
    backgroundColor: '#b0b0b0',
    opacity: 0.5,
  },
  keyText: {
    color: '#3d3d3c',
    fontSize: 22,
    fontWeight: '500',
  },
  
  // Processing Loader Styles
  processingContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  processingContent: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  processingSpinner: {
    marginBottom: 24,
  },
  processingTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#202124',
    marginBottom: 10,
  },
  processingAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#202124',
    marginBottom: 20,
  },
  processingSubText: {
    fontSize: 13,
    color: '#5f6368',
    textAlign: 'center',
    lineHeight: 18,
  },

  // Success Layout Styles (Light Theme matching screenshot)
  successContainer: {
    flex: 1,
    backgroundColor: '#ffffff', // Light theme white background
    justifyContent: 'center',
    alignItems: 'center',
  },
  successContent: {
    alignItems: 'center',
    paddingHorizontal: 24,
    width: '100%',
  },
  successLottie: {
    width: 180,
    height: 180,
    marginBottom: 24,
    alignSelf: 'center',
  },
  successAmount: {
    color: '#202124',
    fontSize: 40,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  successDetails: {
    color: '#202124',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 4,
  },
  successSourceBank: {
    color: '#5f6368',
    fontSize: 14,
    marginBottom: 12,
  },
  successNote: {
    color: '#202124',
    fontSize: 15,
    fontStyle: 'italic',
    marginBottom: 36,
  },
  metadataSection: {
    alignItems: 'center',
    marginBottom: 48,
  },
  metadataText: {
    color: '#5f6368',
    fontSize: 13,
    marginBottom: 6,
  },
  doneBtn: {
    backgroundColor: '#1a73e8', // Done button is styled as Google blue pill
    paddingVertical: 12,
    paddingHorizontal: 80,
    borderRadius: 24,
  },
  doneBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
