'use client';

import { TransactionBlock } from '@mysten/sui.js/transactions';
import { useRouter } from 'next/navigation';
import React from 'react';
import { FooterMenu } from 'src/components/FooterMenu';
import { moveCallMintNft } from 'src/libs/__coco';
import { moveCallSponsored } from 'src/libs/sponsoredZkLogin';
import { useOauth, useZkLogin } from 'src/store';

export default function AuthorizedRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { oauth, initOauthState } = useOauth();
  const { zkLogin, initZkLoginState, zkProofQuery } = useZkLogin();
  const router = useRouter();

  // useEffect(() => {
  //   if (!oauth.jwt) {
  //     router.push('/login');
  //   }
  // }, [oauth, router]);

  const logout = () => {
    initOauthState();
    initZkLoginState();
    router.push('/login');
  };

  const sendTestTx = async () => {
    const txb = new TransactionBlock();
    moveCallMintNft(txb, {
      event_key: 'movejp10',
      name: 'Sui Meetup POAP',
      description: 'Sui Japan Community Event Attendance NFT',
      url: 'ipfs://bafybeiez4cq7ixp6h2fgzlzl2223t4pdydl6udxefxy4lxairivszceptm',
    });
    await moveCallSponsored({ txb, zkLogin, oauth });
  };

  return (
    <>
      {children}

      <div className="absolute bottom-0 left-0 w-full">
        <FooterMenu />
      </div>

      <div className="fixed top-0 right-0 p-4 flex flex-col gap-4">
        <button className="btn btn-info" onClick={sendTestTx}>
          {!zkLogin.zkProof && zkProofQuery.isLoading ? (
            <>
              <span className="loading loading-spinner" />
              Generating zk proof ...
            </>
          ) : (
            'Send sponsored tx with zk login'
          )}
        </button>

        <button className="btn btn-info" onClick={logout}>
          Log out
        </button>

        <button className="btn btn-info" onClick={() => router.push('/gdrive')}>
          Google Drive
        </button>
      </div>
    </>
  );
}
