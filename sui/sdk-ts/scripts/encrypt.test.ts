import CryptoJS from "crypto-js";
import { decode, encode } from "cbor-x";
import assert from "assert";

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

describe("ObjectEncryption Tests", function () {
  const passphrase = "your-passphrase";
  const salt = "your-salt";
  const encryption = new ObjectEncryption(passphrase, salt);

  it("should encrypt and decrypt an object correctly", function () {
    const testObject = { key: "value", anotherKey: 123 };
    const encrypted = encryption.encrypt(testObject);
    const decrypted = encryption.decrypt(encrypted);

    assert.deepStrictEqual(decrypted, testObject);
  });

  it("should fail to decrypt with incorrect key", function () {
    const testObject = { key: "value" };
    const wrongEncryption = new ObjectEncryption("wrong-passphrase", salt);
    const encrypted = encryption.encrypt(testObject);

    assert.throws(() => {
      wrongEncryption.decrypt(encrypted);
    }, Error); // Specify the expected error type if possible
  });

  it("should handle empty objects", function () {
    const testObject = {};
    const encrypted = encryption.encrypt(testObject);
    const decrypted = encryption.decrypt(encrypted);

    assert.deepStrictEqual(decrypted, testObject);
  });

  // Add more test cases as needed
});
