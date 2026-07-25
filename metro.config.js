const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add 'webm' and 'lottie' to asset extensions list so Metro can bundle them properly
config.resolver.assetExts.push('webm');
config.resolver.assetExts.push('lottie');

module.exports = config;
