import { CredentialClaim } from 'src/libs/types';

import { claimSchemaListDrivingBehavior } from './claimSchema/driving_behavior';
import { claimSchemaListTrafficViolation } from './claimSchema/traffic_violation';
import { sampleDrivingBehavior, sampleTrafficViolation } from './samples';

const sampleClaimDrivingBehavior: CredentialClaim[] = claimSchemaListDrivingBehavior.map((item) => {
  const value = sampleDrivingBehavior[item.claim_key as keyof typeof sampleDrivingBehavior];
  return {
    ...item,
    claim_value: BigInt(value),
  };
});

const sampleClaimTrafficViolation: CredentialClaim[] = claimSchemaListTrafficViolation.map(
  (item) => {
    const value = sampleTrafficViolation[item.claim_key as keyof typeof sampleTrafficViolation];
    return {
      ...item,
      claim_value: BigInt(value),
    };
  },
);

export {
  sampleClaimDrivingBehavior,
  sampleClaimTrafficViolation,
  claimSchemaListDrivingBehavior,
  claimSchemaListTrafficViolation,
};
