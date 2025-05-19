import { useState, useEffect } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import { useXNFTWrite } from "../hooks/useXNFT";
import { useAccount } from "wagmi";
import Image from "next/image";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useTokensOfOwner } from "../hooks/useTokenOfOwnerByIndex";
import { 
  ARBITRUM_SEPOLIA_XNFT_ADDRESS, 
  ARBITRUM_SEPOLIA_ROUTER_ADDRESS,
  CHAIN_SELECTORS,
  ETHEREUM_SEPOLIA_XNFT_ADDRESS,
  ETHEREUM_SEPOLIA_LINK_TOKEN_ADDRESS,
  extraArgsBytes
} from "../constants/contract";
import { useTransaction } from "wagmi";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Contract Information Component
const ContractInfo = () => {
  return (
    <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
      <h2 className="text-xl font-semibold mb-4">Thông tin hợp đồng thông minh</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Mạng hiện tại</p>
          <p className="font-mono text-sm">Arbitrum Sepolia</p>
        </div>
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Địa chỉ XNFT</p>
          <a 
            href={`https://sepolia.arbiscan.io/address/${ARBITRUM_SEPOLIA_XNFT_ADDRESS}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-sm text-blue-500 hover:text-blue-600 break-all"
          >
            {ARBITRUM_SEPOLIA_XNFT_ADDRESS}
          </a>
        </div>
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Địa chỉ Router</p>
          <a 
            href={`https://sepolia.arbiscan.io/address/${ARBITRUM_SEPOLIA_ROUTER_ADDRESS}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-sm text-blue-500 hover:text-blue-600 break-all"
          >
            {ARBITRUM_SEPOLIA_ROUTER_ADDRESS}
          </a>
        </div>
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Chain Selector</p>
          <p className="font-mono text-sm">{CHAIN_SELECTORS.ARBITRUM_SEPOLIA}</p>
        </div>
      </div>
    </div>
  );
};

// Transfer Information Component
const TransferInfo = () => {
  return (
    <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
      <h2 className="text-xl font-semibold mb-4">Thông tin chuyển NFT</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Mạng nguồn</p>
          <p className="font-mono text-sm">Arbitrum Sepolia</p>
        </div>
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Mạng đích</p>
          <p className="font-mono text-sm">Ethereum Sepolia</p>
        </div>
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Địa chỉ XNFT đích</p>
          <a 
            href={`https://sepolia.etherscan.io/address/${ETHEREUM_SEPOLIA_XNFT_ADDRESS}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-sm text-blue-500 hover:text-blue-600 break-all"
          >
            {ETHEREUM_SEPOLIA_XNFT_ADDRESS}
          </a>
        </div>
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Token thanh toán</p>
          <a 
            href={`https://sepolia.etherscan.io/address/${ETHEREUM_SEPOLIA_LINK_TOKEN_ADDRESS}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-sm text-blue-500 hover:text-blue-600 break-all"
          >
            {ETHEREUM_SEPOLIA_LINK_TOKEN_ADDRESS}
          </a>
        </div>
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">CCIP Extra Args</p>
          <p className="font-mono text-sm break-all">{extraArgsBytes}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Phương thức thanh toán</p>
          <p className="font-mono text-sm text-blue-600 dark:text-blue-400">LINK Token</p>
        </div>
      </div>
    </div>
  );
};

type NFT = {
  id: number;
  image: string;
  name: string;
  description: string;
};

const getImageType = (tokenId: number): string => {
  return tokenId % 3 === 0 ? 'Orc' : tokenId % 3 === 1 ? 'Elf' : 'Knight';
};

// Hàm lấy dữ liệu NFT - được sử dụng bởi component
export const fetchNFTData = async (tokenId: number): Promise<NFT | null> => {
  try {
    // Gửi API để lấy tokenURI
    const response = await fetch(`/api/tokenURI?tokenId=${tokenId}`);
    
    const tokenURIData = await response.json();
    
    // Xử lý tokenURI
    let metadata;
    if (typeof tokenURIData === 'string') {
      // Nếu tokenURI là URL
      if (tokenURIData.startsWith('http')) {
        const metadataResponse = await fetch(tokenURIData);
        metadata = await metadataResponse.json();
      } 
      // Nếu tokenURI là base64
      else if (tokenURIData.startsWith('data:application/json;base64,')) {
        const base64Data = tokenURIData.replace('data:application/json;base64,', '');
        const jsonString = atob(base64Data);
        metadata = JSON.parse(jsonString);
      }
      // Nếu tokenURI là JSON string
      else {
        try {
          metadata = JSON.parse(tokenURIData);
        } catch {
          // Nếu không phải JSON, sử dụng dữ liệu mặc định
          return {
            id: tokenId,
            image: `/Chainlink_${getImageType(tokenId)}.png`,
            name: `XNFT #${tokenId}`,
            description: 'Cross-chain NFT powered by Chainlink CCIP'
          };
        }
      }
    }
    
    // Nếu không có metadata, sử dụng dữ liệu mặc định
    if (!metadata) {
      return {
        id: tokenId,
        image: `/Chainlink_${getImageType(tokenId)}.png`,
        name: `XNFT #${tokenId}`,
        description: 'Cross-chain NFT powered by Chainlink CCIP'
      };
    }
    
    // Nếu metadata có image là URL, sử dụng URL đó
    // Nếu không, sử dụng hình ảnh mặc định từ thư mục public
    const defaultImage = `/Chainlink_${getImageType(tokenId)}.png`;
    
    return {
      id: tokenId,
      image: metadata.image && metadata.image.startsWith('http') ? metadata.image : defaultImage,
      name: metadata.name || `XNFT #${tokenId}`,
      description: metadata.description || 'Cross-chain NFT powered by Chainlink CCIP'
    };
  } catch (error) {
    console.error(`Error fetching NFT #${tokenId}:`, error);
    // Trả về dữ liệu mặc định nếu có lỗi
    return {
      id: tokenId,
      image: `/Chainlink_${getImageType(tokenId)}.png`,
      name: `XNFT #${tokenId}`,
      description: 'Cross-chain NFT powered by Chainlink CCIP'
    };
  }
};

// Transfer Form Component
const TransferForm = ({ tokenId, onClose }: { tokenId: number, onClose: () => void }) => {
  const { address } = useAccount();
  const [receiver, setReceiver] = useState(address || "");
  const [paymentMethod, setPaymentMethod] = useState<'native' | 'link'>('native');
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();
  const [error, setError] = useState<string | null>(null);

  const {
    write: sendXNFT,
    isPending: isSending,
    isSuccess,
    error: transferError
  } = useXNFTWrite(
    "crossChainTransferFrom",
    [address, receiver, tokenId, BigInt(CHAIN_SELECTORS.ETHEREUM_SEPOLIA), paymentMethod === 'native' ? 0 : 1],
    undefined
  );

  const { isLoading: isTxPending } = useTransaction({
    hash: txHash
  });

  const handleTransfer = async () => {
    if (!address) {
      setError("Vui lòng kết nối ví");
      return;
    }

    if (!receiver) {
      setError("Vui lòng nhập địa chỉ người nhận");
      return;
    }

    if (!receiver.startsWith('0x') || receiver.length !== 42) {
      setError("Địa chỉ người nhận không hợp lệ");
      return;
    }

    setError(null);
    try {
      if (sendXNFT) {
        const hash = await sendXNFT();
        setTxHash(hash);
      }
    } catch (e) {
      console.error("Error sending XNFT:", e);
      setError("Có lỗi xảy ra khi chuyển NFT");
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg mb-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">Chuyển NFT Cross-Chain</h3>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Token ID</label>
          <input
            type="text"
            value={tokenId}
            readOnly
            className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Blockchain đích</label>
          <div className="flex items-center justify-between p-2 border rounded-lg bg-gray-50 dark:bg-gray-700">
            <span>Ethereum Sepolia</span>
            <span className="text-sm text-gray-500">⇄ Đổi</span>
          </div>
          <p className="text-sm text-gray-500 mt-1">Chain Selector: {CHAIN_SELECTORS.ETHEREUM_SEPOLIA}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Địa chỉ người nhận</label>
          <input
            type="text"
            value={receiver}
            onChange={(e) => setReceiver(e.target.value)}
            className="w-full p-2 border rounded-lg"
            placeholder="0x..."
          />
          <button
            onClick={() => setReceiver(address || "")}
            className="text-sm text-blue-600 hover:text-blue-700 mt-1"
          >
            Sử dụng địa chỉ của tôi
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Thanh toán phí bằng</label>
          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input 
                type="radio" 
                name="payment" 
                value="native" 
                checked={paymentMethod === 'native'}
                onChange={() => setPaymentMethod('native')}
                className="mr-2" 
              />
              <span>Native</span>
            </label>
            <label className="flex items-center">
              <input 
                type="radio" 
                name="payment" 
                value="link" 
                checked={paymentMethod === 'link'}
                onChange={() => setPaymentMethod('link')}
                className="mr-2" 
              />
              <span>LINK Token</span>
            </label>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-100 dark:bg-red-900 rounded-lg">
            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
          </div>
        )}

        {transferError && (
          <div className="p-3 bg-red-100 dark:bg-red-900 rounded-lg">
            <p className="text-red-600 dark:text-red-400 text-sm">Lỗi: {transferError.message}</p>
          </div>
        )}

        {isSuccess && (
          <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
            <p className="text-green-600 dark:text-green-400 text-sm">Giao dịch đã được gửi thành công!</p>
            <p className="text-sm mt-1">Transaction Hash: {txHash}</p>
          </div>
        )}

        <button
          onClick={handleTransfer}
          disabled={isSending || isTxPending}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition duration-300 disabled:opacity-50"
        >
          {isSending || isTxPending ? "Đang chuyển..." : "Chuyển NFT"}
        </button>
      </div>
    </div>
  );
};

// Transfer Status Component
const TransferStatus = () => {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg mb-8">
      <h3 className="text-xl font-bold mb-4">Trạng thái chuyển token</h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div>
            <p className="font-medium">Token #1</p>
            <p className="text-sm text-gray-500">Arbitrum Sepolia → Ethereum Sepolia</p>
          </div>
          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">Hoàn thành</span>
        </div>
        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div>
            <p className="font-medium">Token #2</p>
            <p className="text-sm text-gray-500">Arbitrum Sepolia → Ethereum Sepolia</p>
          </div>
          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">Đang xử lý</span>
        </div>
      </div>
    </div>
  );
};

export default function Home() {
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(true);
  const { address, isConnected } = useAccount();
  
  // Mint NFT function
  const { write: mintNFT, isPending: isMinting, isSuccess: isMintSuccess, error: mintError } = useXNFTWrite('mint', []);

  // Lấy danh sách token ID của người dùng
  const { tokenIds, isLoading: isTokenIdsLoading } = useTokensOfOwner();

  const [selectedTokenId, setSelectedTokenId] = useState<number | null>(null);

  // Lấy thông tin NFT từ hợp đồng
  useEffect(() => {
    if (isConnected && tokenIds.length > 0 && !isTokenIdsLoading) {
      setLoading(true);
      const fetchNFTs = async () => {
        try {
          const nftPromises = tokenIds.map(fetchNFTData);
          const nftResults = await Promise.all(nftPromises);
          setNfts(nftResults.filter(nft => nft !== null) as NFT[]);
        } catch (error) {
          console.error("Error fetching NFTs:", error);
        } finally {
          setLoading(false);
        }
      };
      
      fetchNFTs();
    } else {
      setNfts([]);
      setLoading(false);
    }
  }, [isConnected, tokenIds, isTokenIdsLoading, isMintSuccess]);

  const handleTransfer = (tokenId: number) => {
    if (!isConnected) {
      alert("Vui lòng kết nối ví để chuyển NFT");
      return;
    }
    setSelectedTokenId(tokenId);
  };

  const handleCloseTransfer = () => {
    setSelectedTokenId(null);
  };

  const handleMint = () => {
    if (!isConnected) {
      alert("Vui lòng kết nối ví để mint NFT");
      return;
    }
    if (!address) {
      alert("Không thể lấy địa chỉ ví");
      return;
    }
    mintNFT?.();
  };

  return (
    <div
      className={`${geistSans.className} ${geistMono.className} min-h-screen p-8 bg-gray-50 dark:bg-gray-900`}
    >
      <div className="max-w-6xl mx-auto">
        {/* Header with Connect Button */}
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">XNFT Bridge</h1>
          <ConnectButton />
        </header>

        {/* Hero Section */}
        <section className="mb-16 text-center">
          <h1 className="text-4xl font-bold mb-4">XNFT Bridge</h1>
          <p className="text-xl mb-8 text-gray-600 dark:text-gray-300">
            Chuyển NFT giữa các blockchain với Chainlink CCIP
          </p>
          
          <ContractInfo />
          <TransferInfo />
          
          {isConnected ? (
            <div className="flex flex-col items-center">
              <button
                onClick={handleMint}
                disabled={isMinting}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition duration-300 disabled:opacity-50"
              >
                {isMinting ? "Đang mint..." : "Mint XNFT"}
              </button>
              
              {mintError && (
                <p className="mt-4 text-red-500">
                  Lỗi: {mintError.message}
                </p>
              )}
              
              {isMintSuccess && (
                <p className="mt-4 text-green-500">
                  Mint NFT thành công!
                </p>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <p className="text-yellow-600 dark:text-yellow-400 font-medium mb-4">
                Kết nối ví để mint và chuyển NFT
              </p>
              <ConnectButton />
            </div>
          )}
        </section>

        {/* NFT Collection Section */}
        <section>
          <h2 className="text-2xl font-bold mb-6">NFT của bạn</h2>
          
          {loading || isTokenIdsLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white mb-4"></div>
              <p>Đang tải NFTs...</p>
            </div>
          ) : nfts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {nfts.map((nft) => (
                <div key={nft.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden transition-transform hover:scale-105">
                  <div className="relative h-64 w-full">
                    <Image 
                      src={nft.image} 
                      alt={nft.name}
                      width={400}
                      height={400}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2">{nft.name}</h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">{nft.description}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Token ID: {nft.id}</p>
                    
                    <button
                      onClick={() => handleTransfer(nft.id)}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition duration-300"
                    >
                      Chuyển Cross-Chain
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : isConnected ? (
            <div className="text-center py-12 bg-gray-100 dark:bg-gray-800 rounded-xl">
              <p className="mb-4">Bạn chưa có NFT nào</p>
              <button
                onClick={handleMint}
                disabled={isMinting}
                className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition duration-300 disabled:opacity-50"
              >
                {isMinting ? "Đang mint..." : "Mint XNFT đầu tiên"}
              </button>
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-100 dark:bg-gray-800 rounded-xl">
              <p>Kết nối ví để xem NFT của bạn</p>
            </div>
          )}
        </section>

        {selectedTokenId !== null && (
          <>
            <TransferStatus />
            <TransferForm tokenId={selectedTokenId} onClose={handleCloseTransfer} />
          </>
        )}

        {/* How It Works Section */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold mb-6">Cách thức hoạt động</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
              <div className="text-3xl font-bold text-blue-500 mb-4">1</div>
              <h3 className="text-xl font-bold mb-2">Mint NFT</h3>
              <p className="text-gray-600 dark:text-gray-300">Mint XNFT trên blockchain hiện tại của bạn</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
              <div className="text-3xl font-bold text-blue-500 mb-4">2</div>
              <h3 className="text-xl font-bold mb-2">Chọn blockchain đích</h3>
              <p className="text-gray-600 dark:text-gray-300">Chọn blockchain bạn muốn chuyển NFT đến</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
              <div className="text-3xl font-bold text-blue-500 mb-4">3</div>
              <h3 className="text-xl font-bold mb-2">Chuyển NFT</h3>
              <p className="text-gray-600 dark:text-gray-300">NFT sẽ được chuyển qua Chainlink CCIP một cách an toàn</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
