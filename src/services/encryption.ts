import CryptoJS from 'crypto-js';

class EncryptionService {
  private readonly key = 'MyEncryptionKey1234567890123456';

  encrypt(text: string): string {
    if (!text) return text;
    try {
      const keyBytes = CryptoJS.enc.Utf8.parse(this.key.padEnd(32, '\0').substring(0, 32));
      const iv = CryptoJS.lib.WordArray.random(16);
      
      const encrypted = CryptoJS.AES.encrypt(text, keyBytes, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      });
      
      const combined = iv.concat(encrypted.ciphertext);
      return CryptoJS.enc.Base64.stringify(combined);
    } catch (error) {
      console.error('Encryption error:', error);
      return text;
    }
  }

  decrypt(cipherText: string): string {
    if (!cipherText) return cipherText;
    try {
      const keyBytes = CryptoJS.enc.Utf8.parse(this.key.padEnd(32, '\0').substring(0, 32));
      const combined = CryptoJS.enc.Base64.parse(cipherText);
      
      const iv = CryptoJS.lib.WordArray.create(combined.words.slice(0, 4));
      const encrypted = CryptoJS.lib.WordArray.create(combined.words.slice(4));
      
      const decrypted = CryptoJS.AES.decrypt(
        { ciphertext: encrypted } as any,
        keyBytes,
        {
          iv: iv,
          mode: CryptoJS.mode.CBC,
          padding: CryptoJS.pad.Pkcs7
        }
      );
      
      return decrypted.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      console.error('Decryption error:', error);
      return cipherText;
    }
  }
}

export const encryptionService = new EncryptionService();