const path = require('path');
let notifier;
try {
  notifier = require('node-notifier');
} catch (err) {
  notifier = null;
}

// Default options, can be overridden
let defaultOptions = {
  success: {
    title: 'Download Complete',
    message: 'Your video or audio has been downloaded successfully.',
    icon: undefined,
    sound: false,
  },
  error: {
    title: 'Download Failed',
    message: 'There was an error during the download.',
    icon: undefined,
    sound: true,
  },
  enabled: false // Disable notification by default
};

/**
 * Configure default notification options.
 * @param {{success?: object, error?: object, enabled?: boolean}} options
 */
function configure(options = {}) {
  if (options.success) {
    defaultOptions.success = { ...defaultOptions.success, ...options.success };
  }
  if (options.error) {
    defaultOptions.error = { ...defaultOptions.error, ...options.error };
  }
  if (typeof options.enabled === 'boolean') {
    defaultOptions.enabled = options.enabled;
  }
}

/**
 * Send success notification with customized message.
 * @param {string} message - Message to display
 */
function notifySuccess(message) {
  const opts = { ...defaultOptions.success, message };
  if (defaultOptions.enabled && notifier) {
    notifier.notify(opts);
  } else {
    console.log(`✅ ${opts.title}: ${message}`);
  }
}

/**
 * Send error notification with customized message.
 * @param {string} message - Message to display
 */
function notifyError(message) {
  const opts = { ...defaultOptions.error, message };
  if (defaultOptions.enabled && notifier) {
    notifier.notify(opts);
  } else {
    console.error(`❌ ${opts.title}: ${message}`);
  }
}

module.exports = {
  configure,
  notifySuccess,
  notifyError
};