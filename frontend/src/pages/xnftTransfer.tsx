import { useState } from "react";
import { 
  useAccount, 
  useTransaction,
  useContractRead
} from "wagmi";
import { useXNFTWrite } from "../hooks/useXNFT";
import { 
  CHAIN_SELECTORS,
  ETHEREUM_SEPOLIA_XNFT_ADDRESS,
  ETHEREUM_SEPOLIA_LINK_TOKEN_ADDRESS,
  extraArgsBytes,
  ARBITRUM_SEPOLIA_XNFT_ADDRESS
} from "../constants/contract";
import { xnftAbi } from "../contracts/xnftAbi";

const DESTINATION_CHAIN_SELECTOR = BigInt(CHAIN_SELECTORS.ETHEREUM_SEPOLIA);

export default function CrossChainNFTSender() {
  const { address } = useAccount();
  const [tokenId, setTokenId] = useState(0);
  const [receiver, setReceiver] = useState("");

  // Lấy số lượng NFT của người dùng
  const { data: balance } = useContractRead({
    address: ARBITRUM_SEPOLIA_XNFT_ADDRESS as `0x${string}`,
    abi: xnftAbi,
    functionName: 'balanceOf',
    args: [address as `0x${string}`]
  }) as { data: bigint | undefined };

  // Lấy danh sách token ID của người dùng
  const { data: tokenIds } = useContractRead({
    address: ARBITRUM_SEPOLIA_XNFT_ADDRESS as `0x${string}`,
    abi: xnftAbi,
    functionName: 'tokensOfOwner',
    args: [address as `0x${string}`]
  }) as { data: bigint[] | undefined };

  const {
    write: sendXNFT,
    isPending: isSending,
    isSuccess,
    error
  } = useXNFTWrite(
    "crossChainTransferFrom",
    [address, receiver, tokenId, DESTINATION_CHAIN_SELECTOR, 1],
    undefined
  );

  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();

  const { isLoading: isTxPending } = useTransaction({
    hash: txHash
  });

  return (
    <div className="p-4 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Send XNFT from Arbitrum Sepolia to Ethereum Sepolia</h2>
      
      <div className="mb-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <h3 className="font-semibold mb-2">Chain Information:</h3>
        <p className="text-sm">Source Chain: Arbitrum Sepolia</p>
        <p className="text-sm">Destination Chain: Ethereum Sepolia</p>
        <p className="text-sm">Destination XNFT: {ETHEREUM_SEPOLIA_XNFT_ADDRESS}</p>
        <p className="text-sm">LINK Token: {ETHEREUM_SEPOLIA_LINK_TOKEN_ADDRESS}</p>
        <p className="text-sm">CCIP Extra Args: {extraArgsBytes}</p>
        <p className="text-sm mt-2 text-blue-600 dark:text-blue-400">Payment Method: LINK Token</p>
      </div>

      <div className="mb-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <h3 className="font-semibold mb-2">Your NFTs:</h3>
        {balance === BigInt(0) ? (
          <p className="text-sm text-red-500">Bạn chưa có NFT nào</p>
        ) : (
          <div>
            <p className="text-sm mb-2">Số lượng NFT: {balance?.toString()}</p>
            <div className="flex flex-wrap gap-2">
              {tokenIds?.map((id: bigint) => (
                <button
                  key={id.toString()}
                  onClick={() => setTokenId(Number(id))}
                  className={`px-3 py-1 rounded text-sm ${
                    tokenId === Number(id)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                >
                  Token #{id.toString()}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <input
        type="number"
        placeholder="Token ID"
        className="border p-2 w-full mb-4"
        value={tokenId}
        onChange={(e) => setTokenId(Number(e.target.value))}
      />

      <input
        type="text"
        placeholder="Receiver address on Ethereum Sepolia"
        className="border p-2 w-full mb-4"
        value={receiver}
        onChange={(e) => setReceiver(e.target.value)}
      />

      <button
        className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50 w-full"
        onClick={async () => {
          if (sendXNFT) {
            try {
              const hash = await sendXNFT();
              setTxHash(hash);
            } catch (e) {
              console.error("Error sending XNFT:", e);
            }
          }
        }}
        disabled={isSending || isTxPending}
      >
        {isSending || isTxPending ? "Sending..." : "Send XNFT"}
      </button>

      {error && (
        <div className="mt-4 p-4 bg-red-100 dark:bg-red-900 rounded-lg">
          <p className="text-red-600 dark:text-red-400">Error: {error.message}</p>
        </div>
      )}
      
      {isSuccess && (
        <div className="mt-4 p-4 bg-green-100 dark:bg-green-900 rounded-lg">
          <p className="text-green-600 dark:text-green-400">Transaction sent successfully!</p>
          <p className="text-sm mt-2">Transaction Hash: {txHash}</p>
        </div>
      )}
    </div>
  );
}
