'use client';
import { Decimal } from 'decimal.js';
import numeral from 'numeral';
import { CredentialClaim } from 'sion-sdk';
import { match } from 'ts-pattern';

export const formatClaim = (claim: CredentialClaim) => {
  const num = new Decimal(claim.claim_value.toString()).div(1000000).toNumber();
  const display = match(claim.type)
    .with('count', () => `${numeral(num).format('0')} 回`)
    .with('meter', () => `${numeral(num / 1000).format('0')} km`)
    .with('ratio', () => `${numeral(num).format('0.0 %')}`)
    .with('hour', () => `${numeral(num).format('0')} 時間`)
    .otherwise(() => '');

  return display;
};
