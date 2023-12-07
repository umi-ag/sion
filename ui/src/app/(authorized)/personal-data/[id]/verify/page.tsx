'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import React, { useMemo, useState } from 'react';
import { CredentialClaim } from 'sion-sdk';
import { formatClaim } from 'src/utils/formatClaim';
import { claimList } from '../../data';

export const runtime = 'edge';

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
  claims,
  disclosedClaims,
  onChange,
}: {
  title: string;
  claims: CredentialClaim[];
  disclosedClaims: string[];
  onChange?: (claimKey: string, checked: boolean) => void;
}) => {
  const [credClaims] = useState<CredentialClaim[]>(claims);
  const disclosed = (claimKey: string) => disclosedClaims.includes(claimKey);

  const toLabel = (claim: CredentialClaim) => {
    if (!disclosed(claim.claim_key)) {
      return <span className="text-gray-400">{claim.label}</span>;
    }

    const display = formatClaim(claim);
    return (
      <>
        <span>{claim.label}: </span>
        <span className="font-semibold">{display}</span>
      </>
    );
  };

  const Badge = ({ claimKey }: { claimKey: string }) => {
    return (
      <div
        className={`badge badge-accent ${
          !disclosed(claimKey) && 'bg-gray-400 border-gray-400'
        } rounded-full`}
      />
    );
  };

  return (
    <div className="card w-96 bg-accent-200 shadow-xl mb-8">
      <div className="card-body">
        <h2 className="card-title">{title}</h2>
        <ul>
          {credClaims.map((claim) => (
            <li key={claim.label} className="flex items-center gap-2 mb-2 last:mb-0">
              {/* <Checkbox
                label={toLabel(claim)}
                checked={disclosedClaims.includes(claim.claim_key)}
                onChange={(checked) => onChange?.(claim.claim_key, checked)}
              /> */}
              <Badge claimKey={claim.claim_key} />
              <span>{toLabel(claim)}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

const Page = () => {
  // const [selectedClaims, setSelectedClaims] = useState<string[]>([]);
  const router = useRouter();
  // const disclosedClaimKeys = useAtomValue(disclosedClaimKeysAtom);
  const searchParams = useSearchParams();
  const disclosedClaimKeys = useMemo(() => {
    const disclosedClaimKeys = searchParams.get('claims');
    if (!disclosedClaimKeys) {
      return [];
    }
    return disclosedClaimKeys.split(',');
  }, [searchParams]);

  const select = (key: string, checked: boolean) => {
    // if (checked) {
    //   setSelectedClaims([...selectedClaims, key]);
    // } else {
    //   setSelectedClaims(selectedClaims.filter((c) => c !== key));
    // }
  };

  const disclose = () => {
    // setDisclosedClaims(selectedClaims);
    // router.push('/personal-data/all-japan/send');
  };

  return (
    <>
      <h1 className="text-2xl font-bold mb-2">情報開示</h1>
      {/* <p className="text-sm text-gray-400 mb-8">全日本海上保険に開示するデータを選択してください</p> */}

      <Card {...claimList.drivingData} disclosedClaims={disclosedClaimKeys} onChange={select} />
      {/* <Card {...claimList.safeDriving} /> */}

      <div className="grid place-items-center w-full">
        <button
          className="btn btn-active btn-accent"
          // disabled={selectedClaims.length === 0}
          onClick={disclose}
        >
          検証
        </button>
      </div>
    </>
  );
};

export default Page;
