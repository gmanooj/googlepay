import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  Animated,
  StatusBar,
  useColorScheme,
  ActivityIndicator,
  Dimensions,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import * as CameraModule from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';

import { useIsFocused } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

// Safe compatibility check for different Expo SDK camera versions
const CameraViewComponent = (CameraModule.CameraView || CameraModule.Camera) as any;

export default function ScanQrScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const router = useRouter();
  const isFocused = useIsFocused();

  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [torchOn, setTorchOn] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [isScanningImage, setIsScanningImage] = useState(false);

  // Reset scanned state when returning to this screen
  useEffect(() => {
    if (isFocused) {
      setScanned(false);
    }
  }, [isFocused]);

  // Load current permission status
  useEffect(() => {
    (async () => {
      if (CameraModule.Camera) {
        const { status } = await CameraModule.Camera.getCameraPermissionsAsync();
        setHasPermission(status === 'granted');
      }
    })();
  }, []);

  // Request camera permission
  const requestCameraPermission = async () => {
    if (CameraModule.Camera) {
      const { status } = await CameraModule.Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    }
  };

  // Handle scanned barcodes/QR codes
  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (scanned || isScanningImage) return;
    setScanned(true);
    processQRData(data);
  };

  // Parse scanned/uploaded QR content and redirect to payment
  const processQRData = (data: string) => {
    let recipientName = 'Merchant Payee';
    let recipientUpiId = 'merchant@okaxis';
    let amount = '';

    if (data.startsWith('upi://pay?')) {
      const params = data.split('upi://pay?')[1];
      const pairs = params.split('&');
      pairs.forEach(pair => {
        const [key, value] = pair.split('=');
        if (key === 'pa') {
          recipientUpiId = decodeURIComponent(value);
        } else if (key === 'pn') {
          recipientName = decodeURIComponent(value);
        } else if (key === 'am') {
          amount = decodeURIComponent(value);
        }
      });
    } else {
      // Fallback parser if raw string
      if (data.includes('@')) {
        recipientUpiId = data.trim();
        recipientName = data.split('@')[0];
      } else {
        recipientName = data.trim();
        recipientUpiId = data.toLowerCase().replace(/[^a-z0-9]/g, '') + '@okaxis';
      }
    }

    // Direct routing to payee inputs
    router.push({
      pathname: '/pay-amount',
      params: {
        recipientName,
        recipientUpiId,
        amount,
        type: 'business',
      },
    } as any);
  };

  // Gallery QR Image picker upload flow
  const handleUploadFromDevice = async () => {
    try {
      const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!granted) {
        Alert.alert(
          'Permission Needed',
          'Google Pay needs photos library access to choose QR code receipts from your device.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      // Show native scan animation modal
      setIsScanningImage(true);
      
      setTimeout(() => {
        setIsScanningImage(false);
        // Simulate extracting UPI information successfully from the uploaded receipt image
        const mockPayees = [
          { name: 'Karthik Natarajan', upi: 'karthiknatarajan@okaxis' },
          { name: 'Harika Kamineni', upi: 'harikakamineni@okaxis' },
          { name: 'VELAVAN Stores', upi: 'velavanstores@okaxis' },
          { name: 'Jio Prepaid Payee', upi: 'jioprepaid@okaxis' },
        ];
        const selected = mockPayees[Math.floor(Math.random() * mockPayees.length)];
        processQRData(`upi://pay?pa=${selected.upi}&pn=${encodeURIComponent(selected.name)}`);
      }, 1500);

    } catch (err) {
      console.error('Image picker error:', err);
      Alert.alert('Error', 'Failed to open image gallery.');
    }
  };

  // Color tokens
  const themeBgColor = isDark ? '#121212' : '#ffffff';
  const themeTextColor = isDark ? '#ffffff' : '#202124';
  const themeSubTextColor = isDark ? '#9aa0a6' : '#5f6368';
  const themeCardBg = isDark ? '#303134' : '#edf2fa';

  // Render permission request splash screen (matching GPay exactly)
  if (hasPermission === null || hasPermission === false) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: themeBgColor }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

        {/* Back Button */}
        <TouchableOpacity onPress={() => router.back()} style={styles.backButtonTop}>
          <Ionicons name="arrow-back" size={24} color={themeTextColor} />
        </TouchableOpacity>

        {/* permission splash info container */}
        <View style={styles.permissionContent}>
          <View style={[styles.permissionIconWrapper, { backgroundColor: themeCardBg }]}>
            <Ionicons name="camera-outline" size={60} color="#0b57d0" />
          </View>

          <Text style={[styles.permissionTitle, { color: themeTextColor }]}>
            To scan a QR code, allow Google Pay access to your camera
          </Text>

          <Text style={[styles.permissionDesc, { color: themeSubTextColor }]}>
            This lets you make instant payments to merchants and friends by scanning their UPI QR codes.
          </Text>

          {/* Action buttons */}
          <TouchableOpacity 
            style={styles.primaryBtn} 
            onPress={requestCameraPermission}
          >
            <Text style={styles.primaryBtnText}>Turn on camera</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.secondaryBtn, { borderColor: isDark ? '#3c4043' : '#dadce0' }]} 
            onPress={handleUploadFromDevice}
          >
            <Ionicons name="image-outline" size={18} color="#0b57d0" style={{ marginRight: 8 }} />
            <Text style={styles.secondaryBtnText}>Upload from gallery</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Camera Live Scanner UI
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="light-content" />

      {/* Expo Camera component */}
      <CameraViewComponent
        style={StyleSheet.absoluteFill}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        enableTorch={torchOn}
        autofocus="on"
        autoFocus="on"
        responsiveOrientationWhenLocked={true}
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
        barCodeScannerSettings={{
          barCodeTypes: ['qr'],
        }}
      />

      {/* Absolute Mask Overlay (classic border radius cutout trick) */}
      <View style={styles.maskView} pointerEvents="none" />

      {/* Viewport Frame with brackets */}
      <View style={styles.viewPortFrame}>
        {/* Corner brackets in GPay Colors */}
        <View style={[styles.cornerBracket, styles.topLeftBracket]} />
        <View style={[styles.cornerBracket, styles.topRightBracket]} />
        <View style={[styles.cornerBracket, styles.bottomLeftBracket]} />
        <View style={[styles.cornerBracket, styles.bottomRightBracket]} />
      </View>

      {/* Header Row (positioned absolutely) */}
      <SafeAreaView edges={['top']} style={styles.scannerHeaderRow}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerCloseBtn}>
          <Ionicons name="close" size={26} color="#ffffff" />
        </TouchableOpacity>
        
        <View style={styles.headerRightGroup}>
          <TouchableOpacity 
            onPress={() => setTorchOn(!torchOn)} 
            style={[
              styles.headerCircleBtn,
              torchOn ? { backgroundColor: '#ffffff' } : { backgroundColor: 'rgba(255,255,255,0.2)' }
            ]}
          >
            <Ionicons name="flashlight" size={20} color={torchOn ? '#202124' : '#ffffff'} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.headerRightIconBtn}>
            <Ionicons name="qr-code-outline" size={20} color="#ffffff" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.headerRightIconBtn}>
            <Ionicons name="ellipsis-vertical" size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Upload from Gallery Pill Button */}
      <TouchableOpacity style={styles.uploadPill} onPress={handleUploadFromDevice}>
        <Ionicons name="image-outline" size={18} color="#202124" style={{ marginRight: 8 }} />
        <Text style={styles.uploadPillText}>Upload from gallery</Text>
      </TouchableOpacity>

      {/* GPay Rounded Bottom Sheet Card Overlay */}
      <View style={styles.bottomOverlaySheet}>
        <View style={styles.pullTabBar} />
        <Text style={styles.bottomSheetTitle}>Scan any QR code to pay</Text>
        <Text style={styles.bottomSheetSubtitle}>Google Pay • PhonePe • Paytm • UPI</Text>
      </View>

      {/* Simulated Image Pick Loading indicator modal */}
      {isScanningImage && (
        <View style={styles.scanningModalOverlay}>
          <View style={styles.scanningCard}>
            <ActivityIndicator size="large" color="#0b57d0" />
            <Text style={styles.scanningText}>Scanning QR code from gallery...</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backButtonTop: {
    padding: 16,
    alignSelf: 'flex-start',
  },
  permissionContent: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  permissionIconWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  permissionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: 16,
  },
  permissionDesc: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 40,
    paddingHorizontal: 12,
  },
  primaryBtn: {
    backgroundColor: '#0b57d0',
    width: '100%',
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,

  },
  primaryBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  secondaryBtn: {
    flexDirection: 'row',
    borderWidth: 1,
    width: '100%',
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    
  },
  secondaryBtnText: {
    color: '#0b57d0',
    fontSize: 15,
    fontWeight: '900',
  },
  maskView: {
    position: 'absolute',
    top: 180 - 1000,
    left: ((width - 280) / 2) - 1000,
    width: 280 + 2000,
    height: 280 + 2000,
    borderWidth: 1000,
    borderColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 1000 + 24, // inner cutout has a 24px border radius
    backgroundColor: 'transparent',
  },
  viewPortFrame: {
    position: 'absolute',
    top: 172, // 180 (cutout top) minus 8px gap
    left: (width - 296) / 2, // 280 (cutout width) + 16px padding
    width: 296,
    height: 296,
    backgroundColor: 'transparent',
  },
  cornerBracket: {
    position: 'absolute',
    width: 44,
    height: 44,
  },
  topLeftBracket: {
    top: 0,
    left: 0,
    borderTopWidth: 6,
    borderLeftWidth: 6,
    borderTopLeftRadius: 32, // Concentric outer curve (24px inner radius + 8px gap)
    borderColor: '#ea4335',
  },
  topRightBracket: {
    top: 0,
    right: 0,
    borderTopWidth: 6,
    borderRightWidth: 6,
    borderTopRightRadius: 32,
    borderColor: '#f9ab00',
  },
  bottomLeftBracket: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 6,
    borderLeftWidth: 6,
    borderBottomLeftRadius: 32,
    borderColor: '#1a73e8',
  },
  bottomRightBracket: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 6,
    borderRightWidth: 6,
    borderBottomRightRadius: 32,
    borderColor: '#34a853',
  },
  uploadPill: {
    position: 'absolute',
    top: 180 + 280 + 28, // directly below cutout viewport
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 24,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  uploadPillText: {
    color: '#202124',
    fontSize: 14,
    fontWeight: '600',
  },
  bottomOverlaySheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#202124d9',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
  },
  pullTabBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#ffffff4d',
    marginBottom: 16,
  },
  bottomSheetTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
    textAlign: 'center',
  },
  bottomSheetSubtitle: {
    color: '#c4c7c5',
    fontSize: 12,
    textAlign: 'center',
  },
  scannerHeaderRow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 16 : 0,
  },
  headerCloseBtn: {
    padding: 12,
  },
  headerRightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerCircleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerRightIconBtn: {
    padding: 10,
    marginHorizontal: 2,
  },
  scanningModalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 99999,
  },
  scanningCard: {
    backgroundColor: '#ffffff',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    width: width * 0.8,
  },
  scanningText: {
    marginTop: 16,
    fontSize: 14,
    fontWeight: '600',
    color: '#202124',
    textAlign: 'center',
  },
});
