// pages/transfer.tsx
import { useState, useEffect } from 'react';
import { useXNFTWrite } from '../hooks/useXNFT';
import { useRouter } from 'next/router';
import { CHAIN_SELECTORS } from '../constants/contract';
import { useAccount } from 'wagmi';

type ChainSelector = typeof CHAIN_SELECTORS[keyof typeof CHAIN_SELECTORS];

export default function TransferPage() {
  const router = useRouter();
  const { address } = useAccount();
  const [tokenId, setTokenId] = useState('');
  const [destinationChainSelector, setDestinationChainSelector] = useState<ChainSelector>(CHAIN_SELECTORS.ETHEREUM_SEPOLIA);
  const [recipient, setRecipient] = useState('');
  const [payFeesIn, setPayFeesIn] = useState(0); // 0: Native, 1: LINK
  const [currentChain, setCurrentChain] = useState('ARBITRUM_SEPOLIA');

  // Set tokenId from URL query parameter
  useEffect(() => {
    if (router.query.tokenId) {
      setTokenId(router.query.tokenId as string);
    }
    // Set recipient to user's address if available
    if (address) {
      setRecipient(address);
    }
  }, [router.query, address]);

  // Toggle between chains
  const toggleChain = () => {
    if (currentChain === 'ARBITRUM_SEPOLIA') {
      setCurrentChain('ETHEREUM_SEPOLIA');
      setDestinationChainSelector(CHAIN_SELECTORS.ETHEREUM_SEPOLIA);
    } else {
      setCurrentChain('ARBITRUM_SEPOLIA');
      setDestinationChainSelector(CHAIN_SELECTORS.ARBITRUM_SEPOLIA);
    }
  };

  const { write, isPending, isSuccess, error } = useXNFTWrite('crossChainTransferFrom', [
    address, // Sử dụng địa chỉ ví hiện tại của người dùng
    recipient,
    parseInt(tokenId),
    parseInt(destinationChainSelector),
    payFeesIn,
  ]);

  return (
    <div className="max-w-md mx-auto bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Chuyển NFT Cross-Chain</h1>
      
      {!address ? (
        <div className="text-center p-4 bg-yellow-100 text-yellow-700 rounded-md mb-4">
          Vui lòng kết nối ví để thực hiện chuyển NFT
        </div>
      ) : (
        <>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Token ID</label>
            <input
              type="text"
              placeholder="Token ID"
              value={tokenId}
              onChange={(e) => setTokenId(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Blockchain đích</label>
            <div className="flex items-center space-x-2">
              <div className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-700">
                {currentChain === 'ARBITRUM_SEPOLIA' ? 'Ethereum Sepolia' : 'Arbitrum Sepolia'}
              </div>
              <button 
                onClick={toggleChain}
                className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                title="Chuyển đổi blockchain"
              >
                ⇄ Đổi
              </button>
            </div>
            <p className="mt-1 text-xs text-gray-500">Chain Selector: {destinationChainSelector}</p>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Địa chỉ người nhận</label>
            <input
              type="text"
              placeholder="Địa chỉ người nhận"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md"
            />
            <p className="mt-1 text-xs text-gray-500">
              {address && (
                <button 
                  onClick={() => setRecipient(address)}
                  className="text-blue-500 hover:underline"
                >
                  Sử dụng địa chỉ của tôi
                </button>
              )}
            </p>
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium mb-1">Thanh toán phí bằng</label>
            <select 
              value={payFeesIn} 
              onChange={(e) => setPayFeesIn(Number(e.target.value))}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md"
            >
              <option value={0}>Native</option>
              <option value={1}>LINK</option>
            </select>
          </div>
          
          <button 
            onClick={() => write?.()}
            disabled={!write || isPending || !recipient || !tokenId}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? 'Đang xử lý...' : 'Chuyển NFT'}
          </button>
          
          {isSuccess && (
            <div className="mt-4 p-3 bg-green-100 text-green-700 rounded-md">
              Chuyển NFT thành công!
            </div>
          )}
          
          {error && (
            <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
              Lỗi: {error.message}
            </div>
          )}
        </>
      )}
    </div>
  );
}
