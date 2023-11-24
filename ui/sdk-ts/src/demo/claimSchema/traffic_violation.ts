import { CredentialClaimSchema } from 'src/libs/types';

export const claimSchemaListTrafficViolation: CredentialClaimSchema[] = [
  {
    claim_key: 'stop_sign_violations',
    label: '一時停止違反回数',
    type: 'number',
    description: '一時停止違反の回数',
  },
  {
    claim_key: 'red_light_violations',
    label: '信号無視回数',
    type: 'number',
    description: '信号無視の回数',
  },
  {
    claim_key: 'speeding_violations',
    label: '速度超過違反回数',
    type: 'number',
    description: '速度超過違反の回数',
  },
  {
    claim_key: 'parking_violations',
    label: '駐車違反回数',
    type: 'number',
    description: '駐車違反の回数',
  },
  {
    claim_key: 'license_violations',
    label: '免許関連違反回数',
    type: 'number',
    description: '免許証不携帯を含む免許関連違反の回数',
  },
  {
    claim_key: 'accident_counts',
    label: '加害事故回数',
    type: 'number',
    description: '加害事故の回数',
  },
  {
    claim_key: 'drunk_driving_counts',
    label: '飲酒運転回数',
    type: 'number',
    description: '飲酒運転の回数',
  },
  {
    claim_key: 'reckless_driving_counts',
    label: '危険運転回数',
    type: 'number',
    description: '危険運転（着陸違反など）の回数',
  },
  {
    claim_key: 'phone_use_violations',
    label: 'スマホ使用違反回数',
    type: 'number',
    description: '操作中スマホ使用の違反回数',
  },
  {
    claim_key: 'seatbelt_violations',
    label: 'シートベルト違反回数',
    type: 'number',
    description: 'シートベルト着用違反の回数',
  },
  {
    claim_key: 'vehicle_defects',
    label: '車検不良違反回数',
    type: 'number',
    description: '車検不良や装備違反の回数',
  },
] as const;
