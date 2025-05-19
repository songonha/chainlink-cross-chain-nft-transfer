// hooks/useXNFTRead.ts
import { useContractRead, useAccount } from 'wagmi';
import { xnftAbi } from '../contracts/xnftAbi';
import { ARBITRUM_SEPOLIA_XNFT_ADDRESS } from '../constants/contract';

export function useXNFTRead(functionName: string, args: readonly unknown[] = []) {
  const { isConnected } = useAccount();

  const result = useContractRead({
    address: ARBITRUM_SEPOLIA_XNFT_ADDRESS as `0x${string}`,
    abi: xnftAbi,
    functionName,
    args,
  });

  return {
    ...result,
    data: isConnected ? result.data : undefined,
    isError: !isConnected || result.isError,
    error: !isConnected ? new Error('Wallet not connected') : result.error
  };
}

export function useTokenURI(tokenId: number) {
  return useXNFTRead('tokenURI', [tokenId]);
}

export function useBalanceOf(address?: string) {
  return useXNFTRead('balanceOf', address ? [address] : []);
}

export function useOwnerOf(tokenId: number) {
  return useXNFTRead('ownerOf', [tokenId]);
}
