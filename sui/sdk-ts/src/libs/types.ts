export type CredentialClaim = {
  claim_key: string;
  claim_value: bigint;
  type?: string;
  label?: string;
  description?: string;
};

export type CredentialClaimSchema = {
  claim_key: string;
  label: string;
  type: string;
  description: string;
};
