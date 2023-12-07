export const dataList = {
  marketing: {
    title: 'MAZDAマーケティング',
    data: [
      {
        title: '総走行距離',
        description: 'MAZDA車での総走行距離が10,000km以上',
        value: '20,345km',
        threshold: '10,000km',
        active: true,
      },
      {
        title: '保有期間',
        description: 'MAZDA車の保有期間が1年以上',
        value: '3年',
        threshold: '1年',
        active: true,
      },
      {
        title: 'イベント参加回数',
        description: 'イベント参加回数が5回以上',
        value: '8回',
        threshold: '5回',
        active: false,
      },
    ],
  },
  ownership: {
    title: 'MAZDA車保有',
    data: [
      {
        title: '走行距離',
        description: '過去6ヶ月間の走行距離が5,000km以上',
        value: '13,456km',
        threshold: '5,000km',
        active: true,
      },
      {
        title: '事故回数',
        description: '過去6ヶ月間の事故回数が1回未満',
        value: '0回',
        threshold: '1回',
        active: false,
      },
      {
        title: '急ブレーキ回数',
        description: '過去6ヶ月間の急ブレーキ回数が10回以下',
        value: '8回',
        threshold: '10回',
        active: true,
      },
      {
        title: '急ハンドル回数',
        description: '過去6ヶ月間の急ハンドル回数が10回以下',
        value: '3回',
        threshold: '10回',
        active: true,
      },
    ],
  },
};

export type Data = (typeof dataList.marketing.data)[number];

export const toPercent = (data: Data) => {
  const value = parseInt(data.value.replace(',', ''), 10);
  const threshold = parseInt(data.threshold.replace(',', ''), 10);
  return (value / threshold) * 100;
};
