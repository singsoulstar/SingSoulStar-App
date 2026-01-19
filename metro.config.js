const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Explicitly handle web resolution for some edge cases in StackBlitz
config.resolver.sourceExts = [...config.resolver.sourceExts, 'mjs', 'web.js', 'web.ts', 'web.tsx'];

module.exports = config;
