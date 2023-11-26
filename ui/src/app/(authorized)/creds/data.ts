// export const certificates = [
//   { id: 'mazda-royalty', title: 'MAZDAロイヤリティ指数', value: 100 },
//   { id: 'safe-driving', title: '安全運転指数', value: 200 },
//   { id: 'car-kind', title: 'SUV', value: 300 },
// ];

export type CredentialProfile = {
  id: string;
  title: string;
  authenticator: string;
  value: number;
};

export const credentialList: CredentialProfile[] = [
  { id: 'mazda-royalty', title: 'MAZDA車走行データ', authenticator: 'マツダ株式会社', value: 100 },
  { id: 'safe-driving', title: '安全運転データ', authenticator: '警視庁交通課', value: 200 },
  { id: 'car-kind', title: '自動車整備記録', authenticator: 'くるま王', value: 300 },
];
