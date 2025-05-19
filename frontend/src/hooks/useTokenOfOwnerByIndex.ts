// hooks/useTokenOfOwnerByIndex.ts
import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useBalanceOf } from './useXNFTRead';

export function useTokensOfOwner() {
  const { address, isConnected } = useAccount();
  const { data: balanceData, isLoading: isBalanceLoading } = useBalanceOf(address);
  const [tokenIds, setTokenIds] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTokenIds = async () => {
      if (!isConnected || isBalanceLoading || !balanceData || Number(balanceData) === 0) {
        setTokenIds([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const balance = Number(balanceData);
        const ids: number[] = [];
        
        // Giu1ea3 su1eed ru1eb1ng token ID bu1eaft u0111u1ea7u tu1eeb 1 vu00e0 tu0103ng du1ea7n
        // u0110u00e2y lu00e0 cu00e1ch u0111u01a1n giu1ea3n u0111u1ec3 mu00f4 phu1ecfng tokenOfOwnerByIndex
        for (let i = 1; i <= Math.min(balance, 10); i++) {
          ids.push(i);
        }
        
        setTokenIds(ids);
      } catch (error) {
        console.error('Error fetching token IDs:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTokenIds();
  }, [address, balanceData, isBalanceLoading, isConnected]);

  return { tokenIds, isLoading };
}
