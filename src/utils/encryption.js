/**
 * Encryption utilities for secure credential storage
 * Uses Web Crypto API for encryption/decryption
 */

class EncryptionManager {
  constructor() {
    this.algorithm = 'AES-GCM';
    this.keyLength = 256;
  }

  /**
   * Generate a cryptographic key from a password
   * @param {string} password - Password to derive key from
   * @returns {Promise<CryptoKey>} - Derived key
   */
  async deriveKey(password) {
    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      enc.encode(password),
      { name: 'PBKDF2' },
      false,
      ['deriveBits', 'deriveKey']
    );

    // Use a fixed salt for consistency (in production, should be randomly generated and stored)
    const salt = enc.encode('adoc-extension-salt-v1');

    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: this.algorithm, length: this.keyLength },
      false,
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Encrypt data
   * @param {string} data - Data to encrypt
   * @param {string} password - Password for encryption
   * @returns {Promise<string>} - Encrypted data as base64 string
   */
  async encrypt(data, password) {
    try {
      const enc = new TextEncoder();
      const key = await this.deriveKey(password);

      // Generate a random IV
      const iv = crypto.getRandomValues(new Uint8Array(12));

      const encrypted = await crypto.subtle.encrypt(
        {
          name: this.algorithm,
          iv: iv
        },
        key,
        enc.encode(data)
      );

      // Combine IV and encrypted data
      const combined = new Uint8Array(iv.length + encrypted.byteLength);
      combined.set(iv);
      combined.set(new Uint8Array(encrypted), iv.length);

      // Convert to base64 for storage
      return this.arrayBufferToBase64(combined);
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  /**
   * Decrypt data
   * @param {string} encryptedData - Encrypted data as base64 string
   * @param {string} password - Password for decryption
   * @returns {Promise<string>} - Decrypted data
   */
  async decrypt(encryptedData, password) {
    try {
      const dec = new TextDecoder();
      const key = await this.deriveKey(password);

      // Convert from base64
      const combined = this.base64ToArrayBuffer(encryptedData);

      // Extract IV and encrypted data
      const iv = combined.slice(0, 12);
      const encrypted = combined.slice(12);

      const decrypted = await crypto.subtle.decrypt(
        {
          name: this.algorithm,
          iv: iv
        },
        key,
        encrypted
      );

      return dec.decode(decrypted);
    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error('Failed to decrypt data');
    }
  }

  /**
   * Convert ArrayBuffer to base64 string
   * @param {ArrayBuffer} buffer - ArrayBuffer to convert
   * @returns {string} - Base64 encoded string
   */
  arrayBufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  /**
   * Convert base64 string to ArrayBuffer
   * @param {string} base64 - Base64 encoded string
   * @returns {Uint8Array} - ArrayBuffer
   */
  base64ToArrayBuffer(base64) {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }

  /**
   * Generate a random password for encryption
   * @returns {string} - Random password
   */
  generatePassword() {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return this.arrayBufferToBase64(array);
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = EncryptionManager;
}
