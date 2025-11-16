// Extend the global scope with our polyfills
declare global {
  // Add webcrypto to the global namespace
  interface Crypto {
    readonly webkitSubtle?: SubtleCrypto;
  }

  // Ensure these are available globally
  var TextEncoder: {
    prototype: TextEncoder;
    new (): TextEncoder;
  };

  var TextDecoder: {
    prototype: TextDecoder;
    new (label?: string, options?: TextDecoderOptions): TextDecoder;
  };

  // Buffer types are provided by @types/node via next-env, so no redefinition needed.
}

export {};
