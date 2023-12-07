'use client';

import { formatAddress } from '@mysten/sui.js/utils';
import Link from 'next/link';
import React, { useState } from 'react';
import { IoCopyOutline } from 'react-icons/io5';
import { MdLaunch } from 'react-icons/md';
import Jazzicon, { jsNumberForAddress } from 'react-jazzicon';
import { useOauth, useZkLogin } from 'src/store';
import { getExplorerUrlSuiAddress } from 'src/utils/getExplorerUrl';
import { useCopyToClipboard } from 'usehooks-ts';
import { CredentialCard } from './CredentialCard';
import { credentialList } from './data';

const ProfileCard = () => {
  const { zkLogin } = useZkLogin();
  const { oauth } = useOauth();
  const [value, copy] = useCopyToClipboard();
  const [copied, setCopied] = useState(false);

  const handleCopyClick = () => {
    copy(zkLogin.zkLoginAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-accent-100 hover:bg-accent-100 rounded-3xl border-4 border-accent-800 px-6 py-4 mb-6 transition-colors">
      <div className="flex items-center">
        <div className="flex items-center justify-between gap-5">
          <img src={oauth.picture} alt={oauth.name} className="rounded-full w-20 h-20" />
          <div className="flex flex-col gap-2">
            <span className="text-xl font-medium">{oauth.name}</span>
            <div className="flex flex-col justify-items-start">
              <div className="flex items-center justify-between">
                <div
                  className={copied ? 'tooltip tooltip-bottom tooltip-open' : ''}
                  data-tip="Copied!"
                >
                  <button
                    className="flex items-center gap-3 bg-slate-200 hover:bg-slate-300 rounded-full px-3 py-1"
                    onClick={handleCopyClick}
                  >
                    {/* <Jazzicon diameter={24} seed={jsNumberForAddress(zkLogin.zkLoginAddress)} /> */}
                    <span className="text-md font-medium">
                      {formatAddress(zkLogin.zkLoginAddress)}
                    </span>
                    <IoCopyOutline className="font-bold" />
                  </button>
                </div>
                <Link href={getExplorerUrlSuiAddress(zkLogin.zkLoginAddress)} target="_blank">
                  <span className="text-xl hover:bg-slate-200 p-1 rounded-full inline-flex items-center justify-center transition-colors duration-300">
                    <MdLaunch />
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Page = () => {
  return (
    <>
      <h1 className="text-2xl font-bold mb-8">証明書一覧</h1>

      <ProfileCard />

      {credentialList.map((cred) => (
        <Link href={`/creds/${cred.id}`} key={cred.id}>
          <CredentialCard cred={cred} />
        </Link>
      ))}
    </>
  );
};

export default Page;
