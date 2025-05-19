// hooks/useXNFT.ts
import { useContractWrite, useSimulateContract, useAccount } from 'wagmi';
import { xnftAbi } from '../contracts/xnftAbi';
import { ARBITRUM_SEPOLIA_XNFT_ADDRESS } from '../constants/contract';

export function useXNFTWrite(functionName: string, args: readonly unknown[] = [], value?: bigint) {
  const { isConnected } = useAccount();

  const { data, error } = useSimulateContract({
    address: ARBITRUM_SEPOLIA_XNFT_ADDRESS as `0x${string}`,
    abi: xnftAbi,
    functionName,
    args,
    value,
  });

  const { writeContractAsync, isPending, isSuccess, error: writeError } = useContractWrite();
  
  return {
    isPending,
    isSuccess,
    error: error || writeError,
    write: isConnected && data?.request ? () => writeContractAsync(data.request) : undefined,
    isConnected
  };
}
