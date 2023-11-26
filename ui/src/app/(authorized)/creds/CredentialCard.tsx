import React from 'react';
import { CredentialProfile } from './data';

export const CredentialCard: React.FC<{ cred: CredentialProfile }> = (props) => {
  const cert = props.cred;
  // サンプルデータ
  // const sampleData = generateRandomData(JSON.stringify(props), 10, 10, 50);

  return (
    <div className="bg-accent-200 hover:bg-accent-100 rounded-md p-4 mb-6 transition-colors">
      <div className="flex justify-between">
        <div className="flex flex-col justify-between">
          <h2 className="text-2xl font-semibold mb-4">{cert.title}</h2>
          <span className="text-xl font-medium">発行者: {cert.authenticator}</span>
        </div>
        <div>
          <div className="bg-white rounded">{/* <LineChart data={sampleData} /> */}</div>
        </div>
      </div>
    </div>
  );
};
