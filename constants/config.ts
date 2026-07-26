import Constants from 'expo-constants';

/**
 * PRODUCTION BACKEND SERVER URL
 * Replace this string with your live deployed Render URL (e.g., 'https://your-app-name.onrender.com')
 */
export const LIVE_BACKEND_URL = 'https://googlepay-2dsh.onrender.com';

/**
 * Dynamically gets the API base URL:
 * - Uses Metro host IP during local Expo development
 * - Uses LIVE_BACKEND_URL in standalone production APK builds
 */
export const getApiBaseUrl = (): string => {
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const localIp = hostUri.split(':')[0];
    return `http://${localIp}:5000`;
  }
  return LIVE_BACKEND_URL;
};
