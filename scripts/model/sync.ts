import { Note } from "./note";

type EncryptedStr = {
  data: ArrayBuffer,
  iv: Uint8Array,
};

export class Sync {
  static async generateEncryptionKey(): Promise<CryptoKey> {
    return window.crypto.subtle.generateKey(
      { name: "AES-GCM", length: 256 },
      true,
      ["encrypt", "decrypt"],
    );
  }

  static async getEncryptionKey(): Promise<CryptoKey> {
    const key_str = (await chrome.storage.sync.get("encryption-key"))["encryption-key"] as JsonWebKey;

    if (!key_str) {
      console.info("Generating new local key");
      const key = await Sync.generateEncryptionKey();

      await chrome.storage.sync.set({
        "encryption-key": await window.crypto.subtle.exportKey("jwk", key)
      });

      return key;
    }
    else {
      console.log("Local key found");
      return await window.crypto.subtle.importKey(
        "jwk",
        key_str,
        "AES-GCM",
        true,
        ["encrypt", "decrypt"]);
    }
  }

  static generateIV() {
    return window.crypto.getRandomValues(new Uint8Array(12));
  }

  static async encrypt(str: string): Promise<EncryptedStr> {
    const key = await Sync.getEncryptionKey();
    const encoder = new TextEncoder();
    const encodedStr = encoder.encode(str);

    const iv = Sync.generateIV();
    const encrypted = await window.crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv: iv
      },
      key,
      encodedStr,
    );

    return {
      data: encrypted,
      iv
    };
  }

  static async decrypt(encrypted: EncryptedStr): Promise<string> {
    const key = await Sync.getEncryptionKey();

    const decrypted = await window.crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: encrypted.iv
      },
      key,
      encrypted.data,
    );

    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  }
}