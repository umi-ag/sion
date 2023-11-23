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
export const generateRandomData = (
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
export const LineChart: React.FC<{ data: DataPoint[] }> = ({ data }) => {
  const getPath = (data: DataPoint[]): string => {
    return data
      .map((point, i) => {
        return `${i === 0 ? 'M' : 'L'} ${point.x} ${point.y}`;
      })
      .join(' ');
  };

  return (
    <div className="bg-white rounded">
      <svg width="200px" height="100px" viewBox="0 0 100 60">
        {/* SVGのビューボックスを調整 */}
        <title>graph</title>
        <path d={getPath(data)} stroke="blue" strokeWidth="1" fill="none" />
      </svg>
    </div>
  );
};

export type Certificate = {
  id: string;
  title: string;
  value: number;
};

export const Certificate: React.FC<{ certificate: Certificate }> = (props) => {
  const cert = props.certificate;
  // サンプルデータ
  const sampleData = generateRandomData(JSON.stringify(props), 10, 10, 50);

  return (
    <div className="bg-accent-200 hover:bg-accent-100 rounded-md p-4 mb-6 transition-colors">
      <div className="flex justify-between">
        <div className="flex flex-col justify-between">
          <h2 className="font-semibold mb-4">{cert.title}</h2>
          <span className="text-4xl font-bold">{cert.value}</span>
        </div>
        <div>
          <LineChart data={sampleData} />
        </div>
      </div>
    </div>
  );
};
