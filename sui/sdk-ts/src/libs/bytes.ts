import CryptoJS from 'crypto-js';

export const u64ToLEBytes = (number: bigint): Buffer => {
  const buffer = Buffer.alloc(8);
  buffer.writeBigUInt64LE(number);
  return buffer;
};

export const u64ToSha256Digest = (number: bigint): string => {
  const bytes = u64ToLEBytes(number);
  const wordArray = CryptoJS.enc.Hex.parse(bytes.toString('hex'));
  const digest = CryptoJS.SHA256(wordArray).toString(CryptoJS.enc.Hex);
  return digest;
};
