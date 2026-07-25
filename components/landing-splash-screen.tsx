import React, { useEffect } from 'react';
import { StyleSheet, Image, Text, Platform, useColorScheme, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  runOnJS,
  Easing,
} from 'react-native-reanimated';

interface LandingSplashScreenProps {
  onAnimationComplete?: () => void;
}

export default function LandingSplashScreen({ onAnimationComplete }: LandingSplashScreenProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Animation values
  const containerOpacity = useSharedValue(1);
  const coloredScale = useSharedValue(0.3);
  const coloredOpacity = useSharedValue(0);
  const silhouetteOpacity = useSharedValue(1);
  const textOpacity = useSharedValue(0);

  const handleComplete = () => {
    if (onAnimationComplete) {
      onAnimationComplete();
    }
  };

  useEffect(() => {
    // 1. Pop-scale and fade-in the colored logo
    coloredScale.value = withTiming(1.0, {
      duration: 650,
      easing: Easing.out(Easing.back(1.5)),
    });
    coloredOpacity.value = withTiming(1.0, {
      duration: 500,
      easing: Easing.out(Easing.quad),
    });

    // 2. Muted Google text fades in
    textOpacity.value = withDelay(
      150,
      withTiming(1.0, {
        duration: 600,
        easing: Easing.out(Easing.quad),
      })
    );

    // 3. Silhouette fades out after the colored logo completes scaling
    silhouetteOpacity.value = withDelay(
      600,
      withTiming(0, {
        duration: 400,
        easing: Easing.out(Easing.quad),
      })
    );

    // 4. Entire splash screen fades out to reveal home screen
    containerOpacity.value = withDelay(
      1800,
      withTiming(
        0,
        {
          duration: 500,
          easing: Easing.out(Easing.quad),
        },
        (finished) => {
          if (finished) {
            runOnJS(handleComplete)();
          }
        }
      )
    );
  }, []);

  // Animated styles
  const containerStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value,
  }));

  const coloredStyle = useAnimatedStyle(() => ({
    transform: [{ scale: coloredScale.value }],
    opacity: coloredOpacity.value,
  }));

  const silhouetteStyle = useAnimatedStyle(() => ({
    opacity: silhouetteOpacity.value,
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
  }));

  const backgroundColor = isDark ? '#000000' : '#ffffff';
  const googleTextColor = isDark ? '#9aa0a6' : '#5f6368';
  const silhouetteColor = isDark ? '#303134' : '#e8eaed';

  return (
    <Animated.View style={[styles.container, { backgroundColor }, containerStyle]}>
      {/* Centered logo wrapper */}
      <View style={styles.logoWrapper}>
        {/* Underlay: Light grey logo silhouette */}
        <Animated.View style={[styles.logoItem, styles.silhouette, silhouetteStyle]}>
          <Image
            source={require('@/assets/images/favicon.png')}
            style={styles.logoImage}
            tintColor={silhouetteColor}
            resizeMode="contain"
          />
        </Animated.View>

        {/* Overlay: Animated colored logo */}
        <Animated.View style={[styles.logoItem, styles.colored, coloredStyle]}>
          <Image
            source={require('@/assets/images/favicon.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </Animated.View>
      </View>

      {/* Bottom Google Brand text */}
      <Animated.View style={[styles.bottomContainer, textStyle]}>
        <Text style={[styles.googleText, { color: googleTextColor }]}>Google</Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 99999,
  },
  logoWrapper: {
    width: 120,
    height: 101,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  logoItem: {
    position: 'absolute',
    width: 120,
    height: 101,
    justifyContent: 'center',
    alignItems: 'center',
  },
  silhouette: {
    zIndex: 1,
  },
  colored: {
    zIndex: 2,
  },
  logoImage: {
    width: 120,
    height: 101,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 50,
    alignItems: 'center',
  },
  googleText: {
    fontSize: 24,
    fontWeight: '600',
    letterSpacing: -0.5,
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'sans-serif-medium',
  },
});
