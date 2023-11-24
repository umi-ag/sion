import { u64ToLEBytes, u64ToSha256Digest } from '../src/libs/bytes';
import CryptoJS from 'crypto-js';

test('u64ToLEBytes should convert 0x123456 to the correct byte sequence', () => {
  const inputNumber = BigInt(0x123456);

  const expected = Buffer.from([0x56, 0x34, 0x12, 0x00, 0x00, 0x00, 0x00, 0x00]);

  // Call the function with the input
  const actual = u64ToLEBytes(inputNumber);

  // Assert that the result matches the expected output
  expect(actual).toEqual(expected);
});

test('u64ToSha256Digest should convert 0x123456 to the correct digest', () => {
  const inputNumber = BigInt(0x123456);

  const expected = '2b596e4b230759a22d18592d73c889dc1f67b0d3ebc082f2c0c32bb379782edb';
  const actual = u64ToSha256Digest(inputNumber);

  // Assert that the result matches the expected output
  expect(actual).toEqual(expected);
});
