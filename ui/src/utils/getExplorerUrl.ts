import { normalizeSuiAddress } from '@mysten/sui.js/utils';
import { NETWORK } from 'src/config/sui';

type Network = 'mainnet' | 'testnet' | 'devnet';

const baseUrl = 'https://suiexplorer.com';

export const getExplorerUrlSuiAddress = (suiAddress: string, network: Network = NETWORK) => {
  return `${baseUrl}/address/${normalizeSuiAddress(suiAddress)}?network=${network}`;
};
