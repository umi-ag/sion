'use client';

import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { CredentialClaim, sampleClaimDrivingBehavior, sampleClaimTrafficViolation } from 'sion-sdk';
import { formatClaim } from 'src/utils/formatClaim';

const Checkbox: React.FC<{
  label: React.ReactNode;
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

const Card = ({
  title,
  claim,
  selectedClaims,
  onChange,
}: {
  title: string;
  claim: CredentialClaim[];
  selectedClaims: string[];
  onChange?: (claimKey: string, checked: boolean) => void;
}) => {
  const [credClaims] = useState<CredentialClaim[]>(claim);

  const toLabel = (claim: CredentialClaim) => {
    const display = formatClaim(claim);
    return (
      <>
        <span>{claim.label}: </span>
        <span className="font-semibold">{display}</span>
      </>
    );
  };

  return (
    <div className="card w-96 bg-accent-200 shadow-xl mb-8">
      <div className="card-body">
        <h2 className="card-title">{title}</h2>
        <ul>
          {credClaims.map((claim) => (
            <li key={claim.label}>
              <Checkbox
                label={toLabel(claim)}
                checked={selectedClaims.includes(claim.claim_key)}
                onChange={(checked) => onChange?.(claim.claim_key, checked)}
              />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

const Page = () => {
  const [selectedClaims, setSelectedClaims] = useState<string[]>([]);
  const router = useRouter();

  const claimList = {
    drivingData: {
      title: 'MAZDA車走行データ',
      claim: sampleClaimDrivingBehavior,
    },
    safeDriving: {
      title: '安全運転データ',
      claim: sampleClaimTrafficViolation,
    },
  };

  const select = (key: string, checked: boolean) => {
    if (checked) {
      setSelectedClaims([...selectedClaims, key]);
    } else {
      setSelectedClaims(selectedClaims.filter((c) => c !== key));
    }
  };

  return (
    <>
      <h1 className="text-2xl font-bold mb-2">情報開示</h1>
      <p className="text-sm text-gray-400 mb-8">全日本海上保険に開示するデータを選択してください</p>

      <Card {...claimList.drivingData} selectedClaims={selectedClaims} onChange={select} />
      {/* <Card {...claimList.safeDriving} /> */}

      <div className="grid place-items-center w-full">
        <button
          className="btn btn-active btn-accent"
          disabled={selectedClaims.length === 0}
          onClick={() => {
            router.push('/personal-data/all-japan/send');
          }}
        >
          データを開示する
        </button>
      </div>
    </>
  );
};

export default Page;
