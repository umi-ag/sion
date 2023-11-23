import CryptoJS from 'crypto-js';
import sha256 from 'crypto-js/sha256';

const message = "Hello, World!";
const digest = sha256(message);
console.log(digest.toString())

let data = {
  odometer_reading: 1200,
  fuel_usage: 100,
}

Object.entries(data).forEach(([key, value]) => {
  const digest = sha256(value);
  const hex = digest.toString(CryptoJS.enc.Hex)
  const bytes = Buffer.from(hex , 'hex');

  console.log(key, bytes)
})

Object.entries(data).forEach(([key, value]) => {
  const digest = sha256(value);
  const hex = digest.toString(CryptoJS.enc.Hex)
  const bytes = Buffer.from(hex , 'hex');

  console.log(key, bytes)
})