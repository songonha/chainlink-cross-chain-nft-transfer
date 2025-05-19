// pages/api/tokenURI.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { createPublicClient, http } from 'viem';
import { arbitrumSepolia } from 'viem/chains';
import { xnftAbi } from '../../contracts/xnftAbi';
import { ARBITRUM_SEPOLIA_XNFT_ADDRESS } from '../../constants/contract';

const publicClient = createPublicClient({
  chain: arbitrumSepolia,
  transport: http(),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { tokenId } = req.query;
    
    if (!tokenId || Array.isArray(tokenId)) {
      return res.status(400).json({ error: 'Invalid tokenId parameter' });
    }

    // Lu1ea5y tokenURI tu1eeb hu1ee3p u0111u1ed3ng XNFT
    const tokenURI = await publicClient.readContract({
      address: ARBITRUM_SEPOLIA_XNFT_ADDRESS as `0x${string}`,
      abi: xnftAbi,
      functionName: 'tokenURI',
      args: [BigInt(tokenId)],
    });

    return res.status(200).json(tokenURI);
  } catch (error: Error | unknown) {
    console.error('Error fetching tokenURI:', error);
    
    // Nu1ebfu cu00f3 lu1ed7i, tru1ea3 vu1ec1 du1eef liu1ec7u mu1eb7c u0111u1ecbnh
    const defaultImage = `Chainlink_${Number(req.query.tokenId) % 3 === 0 ? 'Orc' : Number(req.query.tokenId) % 3 === 1 ? 'Elf' : 'Knight'}.png`;
    const defaultMetadata = {
      name: `XNFT #${req.query.tokenId}`,
      description: 'Cross-chain NFT powered by Chainlink CCIP',
      image: defaultImage
    };
    
    return res.status(200).json(defaultMetadata);
  }
}
