import { SuiTransactionBlockResponse } from '@mysten/sui.js/client';
import { isContainsClaimEvent } from '../moveCall/sion/membership/structs';

export const sionTransactionResponseResolver = {
  verifyClaimDigest: (
    response: SuiTransactionBlockResponse,
    args: {
      authenticator: string;
    },
  ): boolean => {
    const events = response.events?.filter((event) => isContainsClaimEvent(event.type)) ?? [];
    console.log(JSON.stringify(events, null, 2));
    const everyExpectedAuthenticator = Array.from(events).every(
      (event) => event?.parsedJson?.authenticator === args.authenticator,
    );
    const everyTrusted = Array.from(events).every(
      (event) => event?.parsedJson?.is_verified ?? false,
    );
    const isVerified = everyExpectedAuthenticator && everyTrusted;
    return isVerified;
  },
};
