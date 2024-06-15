import { Note, NoteLike } from "./note";

// type EncryptedStr = {
//   data: ArrayBuffer,
//   iv: Uint8Array,
// };

type EncryptedStr = {
  data: string,
  iv: string,
};

function encodeArrayBuffer(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  const base64String = btoa(String.fromCharCode(...bytes));
  return base64String;
}

function encodeUint8Array(array: Uint8Array): string {
  return encodeArrayBuffer(array.buffer);
}

function decodeBase64ToArrayBuffer(base64String: string): ArrayBuffer {
  const bytes = atob(base64String);
  const bytesArray = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) {
    bytesArray[i] = bytes.charCodeAt(i);
  }
  return bytesArray.buffer;
}

function decodeUint8Array(base64String: string): Uint8Array {
  const buffer = decodeBase64ToArrayBuffer(base64String);
  return new Uint8Array(buffer);
}

export class Sync {
  static async generateEncryptionKey(): Promise<CryptoKey> {
    return window.crypto.subtle.generateKey(
      { name: "AES-GCM", length: 256 },
      true,
      ["encrypt", "decrypt"],
    );
  }

  static generateIV() {
    return window.crypto.getRandomValues(new Uint8Array(12));
  }

  static async getUserKey(): Promise<string> {
    const pui = await chrome.identity.getProfileUserInfo({ accountStatus: "ANY" });
    return pui.id;
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

  static async encrypt(str: string, iv: Uint8Array | undefined = undefined): Promise<EncryptedStr> {
    const key = await Sync.getEncryptionKey();
    const encoder = new TextEncoder();
    const encodedStr = encoder.encode(str);

    iv = iv || Sync.generateIV();
    const encrypted = await window.crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv: iv
      },
      key,
      encodedStr,
    );

    return {
      data: encodeArrayBuffer(encrypted),
      iv: encodeUint8Array(iv)
    };
  }

  static async decrypt(encrypted: EncryptedStr): Promise<string> {
    const key = await Sync.getEncryptionKey();

    const decrypted = await window.crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: decodeUint8Array(encrypted.iv)
      },
      key,
      decodeBase64ToArrayBuffer(encrypted.data),
    );

    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  }

  static async uploadNotes(notes: Note[]) {
    const notes_str = JSON.stringify(notes);
    const notes_encrypted = await Sync.encrypt(notes_str);
    const body = JSON.stringify(notes_encrypted);
    const userid = await this.getUserKey();

    const UPLOAD_URL = `https://europe-west6-notes-extension-425902.cloudfunctions.net/postNotes/user/${userid}`;
    await fetch(UPLOAD_URL, {
      method: 'POST',
      headers: {
        'Accept': 'application/json, application/xml, text/plain, text/html, *.*',
        'Content-Type': 'application/json; charset=utf-8'
      },
      body: body
    });
  }

  static async downloadNotes(): Promise<Note[]> {
    const userid = await this.getUserKey();

    const UPLOAD_URL = `https://europe-west6-notes-extension-425902.cloudfunctions.net/getNotes/user/${userid}`;
    const response = await fetch(UPLOAD_URL);

    const notes_encrypted = await response.json();
    const notes_str = await Sync.decrypt(notes_encrypted);
    const notes = JSON.parse(notes_str).map((n: NoteLike) => Note.fromNoteLike(n));
    return notes;
  }
}