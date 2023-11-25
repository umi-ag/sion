'use client';
export const runtime = 'edge';

import { claimSchemaListDrivingBehavior, sampleClaimDrivingBehavior } from 'sion-sdk';
import { moveCallMembershipRegistryObject } from 'src/libs/authenticator/register_member';

const Page = ({ params }: { params: { id: string } }) => {
  return (
    <>
      <h1 className="text-2xl font-bold mb-8">Admin</h1>

      <button
        className="btn btn-primary"
        onClick={async () => {
          const membershipRegistry = await moveCallMembershipRegistryObject();
          console.log({ membershipRegistry });
        }}
      >
        CREATE REGISTRY
      </button>
    </>
  );
};

export default Page;
