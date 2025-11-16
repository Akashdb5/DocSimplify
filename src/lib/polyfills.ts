// Polyfill for Web Crypto API in Node.js
if (typeof crypto === 'undefined') {
  try {
    global.crypto = require('crypto').webcrypto;
  } catch (err) {
    console.warn('WebCrypto API not available. Some features may not work as expected.');
  }
}

// Ensure Buffer is available globally
if (typeof Buffer === 'undefined') {
  global.Buffer = require('buffer').Buffer;
}

// Ensure process is available
if (typeof process === 'undefined') {
  global.process = require('process');
}

// Ensure TextEncoder/TextDecoder are available
if (typeof TextEncoder === 'undefined') {
  global.TextEncoder = require('util').TextEncoder;
  global.TextDecoder = require('util').TextDecoder;
}
