'use client';

import React from 'react';
import { LineChart, generateRandomData } from 'src/components/LineChart';

const Checkbox: React.FC<{
  label: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
}> = ({ label, checked, onChange }) => {
  return (
    <div className="form-control">
      <label className="cursor-pointer label justify-start gap-4">
        <input
          type="checkbox"
          checked={!!checked}
          onChange={(e) => onChange?.(e.target.checked)}
          className="checkbox checkbox-accent"
        />
        <span className="label-text">{label}</span>
      </label>
    </div>
  );
};

const Card = () => {
  const graphData = generateRandomData('マツダロイヤリティ', 20, 10, 50);

  return (
    <div className="card w-96 bg-accent-200 shadow-xl">
      <figure className="px-10 pt-10">
        <div className="grid place-items-center bg-white w-80 h-40 rounded-xl">
          <div className="scale-150">
            <LineChart data={graphData} />
          </div>
        </div>
      </figure>
      <div className="card-body">
        <h2 className="card-title">MAZDA ロイヤリティ</h2>
        <p className="text-4xl font-bold">140</p>
        <h3 className="text-xl">これまでのデータ</h3>
        <ul>
          <li>
            <Checkbox label="イベント参加回数: 12回" checked />
          </li>
          <li>
            <Checkbox label="総走行距離: 12,345km" />
          </li>
          <li>
            <Checkbox label="急ハンドル回数: 6回" checked />
          </li>
        </ul>
        {/* <div className="card-actions grid place-items-center">
          <button className="btn btn-primary">Buy Now</button>
        </div> */}
      </div>
    </div>
  );
};

const Page = () => {
  return (
    <>
      <h1 className="text-2xl font-bold mb-8">個人情報</h1>
      <span>個人情報</span>
      <Card />
    </>
  );
};

export default Page;
