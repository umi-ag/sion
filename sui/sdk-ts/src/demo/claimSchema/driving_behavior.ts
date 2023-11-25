import { CredentialClaimSchema } from 'src/libs/types';

export const claimSchemaListDrivingBehavior: CredentialClaimSchema[] = [
  {
    claim_key: 'driving_distance',
    label: '走行距離',
    type: 'meter',
    description: '中古車の価値判断や保険料算出に直接関係',
  },
  {
    claim_key: 'rapid_acceleration_count',
    label: '急加速回数',
    type: 'count',
    description: 'エコドライブ適合度を示す項目',
  },
  {
    claim_key: 'rapid_deceleration_count',
    label: '急減速回数',
    type: 'count',
    description: 'エコドライブ適合度を示す項目',
  },
  {
    claim_key: 'sharp_steering_count',
    label: '急ハンドル回数',
    type: 'count',
    description: '運転の荒さを示す項目',
  },
  // {
  //   claim_key: 'speeding_violation_count',
  //   label: '速度超過違反回数',
  //   type: 'number',
  //   description: '速度制限を守れているかどうか',
  // },
  // {
  //   claim_key: 'traffic_signal_violation_count',
  //   label: '信号無視・一時不停止違反回数',
  //   type: 'number',
  //   description: '交通規則遵守度を示す',
  // },
  {
    claim_key: 'night_driving_distance_ratio',
    label: '夜間走行距離比率',
    type: 'ratio',
    description: '夜間の運転リスクを示す',
  },
  {
    claim_key: 'highway_driving_distance_ratio',
    label: '高速道路走行距離比率',
    type: 'ratio',
    description: '高速安定性を示す',
  },
  {
    claim_key: 'over_idle_time',
    label: '過怠速/アイドリング時間',
    type: 'hour',
    description: '燃費や排気量と相関',
  },
  {
    claim_key: 'overheat_count',
    label: 'オーバーヒート回数',
    type: 'count',
    description: 'エンジンの故障履歴',
  },
  // {
  //   claim_key: 'maintenance_history',
  //   label: 'メンテナンス履歴',
  //   type: 'string',
  //   description: '定期点検やオイル交換のタイミング',
  // },
] as const;
