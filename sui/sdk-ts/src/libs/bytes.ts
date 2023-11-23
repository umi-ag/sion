import crypto from 'crypto';

export const u64ToLEBytes = (number: number): Buffer => {
  const buffer = Buffer.alloc(8);
  buffer.writeBigUInt64LE(BigInt(number));
  return buffer;
};

export const u64ToSha256Digest = (number: number): string => {
  const bytes = u64ToLEBytes(number);
  const digest = crypto.createHash('sha256').update(bytes).digest('hex');
  return digest;
};
