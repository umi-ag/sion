// Crypto-JSライブラリのインポート
import CryptoJS from 'crypto-js';

// キー導出のためのパスワードとソルト
const passphrase: string = "secret passphrase";
const salt: CryptoJS.lib.WordArray = CryptoJS.lib.WordArray.random(128/8); // 16 bytes

// PBKDF2を使用してキーを導出
const key: CryptoJS.lib.WordArray = CryptoJS.PBKDF2(passphrase, salt, {
    keySize: 256/32, // 8 words
    iterations: 1000
});

// キーをヘックス文字列に変換
const keyString: string = key.toString(CryptoJS.enc.Hex);

// 暗号化するデータ
const dataToEncrypt: string = "Hello, World!";

// データの暗号化
const encrypted: CryptoJS.lib.CipherParams = CryptoJS.AES.encrypt(dataToEncrypt, keyString, {
    mode: CryptoJS.mode.CFB,
    padding: CryptoJS.pad.Pkcs7
});

// 暗号化されたデータの出力
console.log("Encrypted data: " + encrypted.toString());

// データの復号
const decrypted: CryptoJS.lib.WordArray = CryptoJS.AES.decrypt(encrypted, keyString, {
    mode: CryptoJS.mode.CFB,
    padding: CryptoJS.pad.Pkcs7
});

// 復号されたデータの出力
console.log("Decrypted data: " + decrypted.toString(CryptoJS.enc.Utf8));
