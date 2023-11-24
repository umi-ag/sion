import CryptoJS from "crypto-js";
import { decode, encode } from "cbor-x";

export class ObjectEncryption<T> {
  private passphrase: string;
  private salt: string | CryptoJS.lib.WordArray;
  private keyString: string;

  constructor(passphrase: string, salt: string | CryptoJS.lib.WordArray) {
    this.passphrase = passphrase;
    this.salt = salt;

    const key: CryptoJS.lib.WordArray = CryptoJS.PBKDF2(
      this.passphrase,
      this.salt,
      {
        keySize: 256 / 32, // 8 words
        iterations: 1000,
      },
    );

    this.keyString = key.toString(CryptoJS.enc.Hex);
  }

  encrypt(obj: T): string {
    const message = encode(obj).toString("binary");

    const encrypted = CryptoJS.AES.encrypt(
      message,
      this.keyString,
      {
        mode: CryptoJS.mode.CFB,
        padding: CryptoJS.pad.Pkcs7,
      },
    );

    return encrypted.toString();
  }

  decrypt(encryptedData: string): T {
    const decrypted = CryptoJS.AES.decrypt(encryptedData, this.keyString, {
      mode: CryptoJS.mode.CFB,
      padding: CryptoJS.pad.Pkcs7,
    });

    const hex = decrypted.toString(CryptoJS.enc.Utf8);
    const bytes = Buffer.from(hex, "binary");
    const data = decode(bytes);

    return data;
  }
}

