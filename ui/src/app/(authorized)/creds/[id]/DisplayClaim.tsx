'use client';
import { CredentialClaim } from 'sion-sdk';
import { formatClaim } from 'src/utils/formatClaim';

export const DisplayClaim = (claim: CredentialClaim) => {
  const display = formatClaim(claim);

  return (
    <li className="flex items-center gap-3">
      <span>{claim.label}:</span>
      <span>{display}</span>
    </li>
  );
};
