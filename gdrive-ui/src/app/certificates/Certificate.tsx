import React from 'react';

// データポイントの型定義
interface DataPoint {
  x: number;
  y: number;
}

// 文字列シードを数値に変換
const stringToSeed = (str: string): number => {
  return Array.from(str).reduce((acc, char) => acc + char.charCodeAt(0), 0);
};

// 疑似乱数生成器（線形合同法）
const seededRandom = (seed: number) => {
  let value = seed;
  return () => {
    value = (value * 9301 + 49297) % 233280;
    return value / 233280;
  };
};

// シード値に基づいてランダムなデータポイントを生成する関数
const generateRandomData = (
  seed: string | number,
  count: number,
  min: number,
  max: number,
): DataPoint[] => {
  const numericSeed = typeof seed === 'string' ? stringToSeed(seed) : seed;
  const random = seededRandom(numericSeed);
  const range = max - min;
  return Array.from({ length: count }, (_, i) => ({
    x: i * (100 / (count - 1)), // SVGの幅に合わせて調整
    y: min + Math.floor(random() * range),
  }));
};

// コンポーネントの定義
const LineChart: React.FC<{ data: DataPoint[] }> = ({ data }) => {
  const getPath = (data: DataPoint[]): string => {
    return data
      .map((point, i) => {
        return `${i === 0 ? 'M' : 'L'} ${point.x} ${point.y}`;
      })
      .join(' ');
  };

  return (
    <svg width="200px" height="100px" viewBox="0 0 100 60">
      {' '}
      {/* SVGのビューボックスを調整 */}
      <title>graph</title>
      <path d={getPath(data)} stroke="blue" strokeWidth="1" fill="none" />
    </svg>
  );
};

export const Certificate: React.FC<{ title: string; value: number }> = (props) => {
  // サンプルデータ
  const sampleData = generateRandomData(JSON.stringify(props), 10, 10, 50);

  return (
    <div className="bg-accent-100 rounded-md p-4 mb-6">
      <div className="flex justify-between">
        <div>
          <h2 className="font-semibold mb-4">{props.title}</h2>
          <span className="text-3xl font-bold">{props.value}</span>
        </div>
        <div>
          <LineChart data={sampleData} />
        </div>
      </div>
    </div>
  );
};
