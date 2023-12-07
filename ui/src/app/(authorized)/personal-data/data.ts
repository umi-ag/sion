import { sampleClaimDrivingBehavior, sampleClaimTrafficViolation } from 'sion-sdk';

export const claimList = {
  drivingData: {
    title: 'MAZDA車走行データ',
    claims: sampleClaimDrivingBehavior,
  },
  safeDriving: {
    title: '安全運転データ',
    claims: sampleClaimTrafficViolation,
  },
};
