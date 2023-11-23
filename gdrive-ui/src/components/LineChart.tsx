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
  const data = Array.from({ length: count }, (_, i) => ({
    x: i * (100 / (count - 1)),
    y: min + Math.floor(random() * range),
  }));
  return data.reverse();
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
    <svg width="200px" height="100px" viewBox="0 0 100 60">
      {/* SVGのビューボックスを調整 */}
      <title>graph</title>
      <path d={getPath(data)} stroke="blue" strokeWidth="1" fill="none" />
    </svg>
  );
};
