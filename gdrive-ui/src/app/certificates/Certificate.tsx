import React from 'react';
import { LineChart, generateRandomData } from '../../components/LineChart';

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
          <div className="bg-white rounded">
            <LineChart data={sampleData} />
          </div>
        </div>
      </div>
    </div>
  );
};
