import { SuiClient } from '@mysten/sui.js/dist/cjs/client';
import { MembershipPointer } from '../moveCall/sion/membership-pointer/structs';

export const getOwnedMembershipPointerObjectId = async (
  client: SuiClient,
  args: { address: string },
) => {
  const data = await client.getOwnedObjects({
    owner: args.address,
    filter: {
      MatchAll: [{ StructType: MembershipPointer.$typeName }, { AddressOwner: args.address }],
    },
    options: {
      showType: true,
      showOwner: true,
      showPreviousTransaction: true,
      showDisplay: false,
      showContent: false,
      showBcs: false,
      showStorageRebate: false,
    },
  });

  console.log(JSON.stringify(data, null, 2));
  const objectId = data?.data?.[0]?.data?.objectId ?? null;
  return objectId;
};

export const getOwnedMembershipObjectId = async (client: SuiClient, args: { address: string }) => {
  const membershipPointerId = await getOwnedMembershipPointerObjectId(client, args);
  if (!membershipPointerId) return null;

  const data = await client.getObject({
    id: membershipPointerId,
    options: {
      showContent: true,
      showOwner: true,
    },
  });

  console.log(JSON.stringify(data, null, 2));
  const membershipId = data.data?.content?.fields?.membership_id ?? null;
  return membershipId;
};
