const { withNativeWind } = require('nativewind/metro');
const {
  getSentryExpoConfig
} = require("@sentry/react-native/metro");

// Get the Sentry config. 
// We use `.` instead of `__dirname` to work around a Metro issue on Windows.
const config = getSentryExpoConfig('.');

module.exports = withNativeWind(config, { input: './global.css' });