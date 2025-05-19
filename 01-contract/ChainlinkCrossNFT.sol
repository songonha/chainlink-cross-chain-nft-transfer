// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "@openzeppelin/contracts@4.6.0/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts@4.6.0/utils/Base64.sol";

contract ChainlinkCrossNFT is ERC721URIStorage {
    using Strings for uint256;

    uint256 public tokenId;

    // Danh sách URL hình ảnh IPFS
    string[] internal characters = [
        "https://ipfs.io/ipfs/QmTgqnhFBMkfT9s8PHKcdXBn1f5bG3Q5hmBaR4U6hoTvb1?filename=Chainlink_Elf.png",
        "https://ipfs.io/ipfs/QmZGQA92ri1jfzSu61JRaNQXYg1bLuM7p8YT83DzFA2KLH?filename=Chainlink_Knight.png",
        "https://ipfs.io/ipfs/QmW1toapYs7M29rzLXTENn3pbvwe8ioikX1PwzACzjfdHP?filename=Chainlink_Orc.png",
        "https://ipfs.io/ipfs/QmPMwQtFpEdKrUjpQJfoTeZS1aVSeuJT6Mof7uV29AcUpF?filename=Chainlink_Witch.png"
    ];

    constructor() ERC721("My Chainlink NFT", "MCN") {
        mint(msg.sender);
    }

    function mint(address to) public {
        uint256 currentId = tokenId;
        uint256 charId = currentId % characters.length;

        // Tạo JSON metadata
        string memory json = Base64.encode(
            bytes(
                string(
                    abi.encodePacked(
                        '{',
                            '"name": "Chainlink NFT #', currentId.toString(), '",',
                            '"description": "This is your Chainlink-powered onchain NFT.",',
                            '"image": "', characters[charId], '",',
                            '"attributes": [',
                                '{ "trait_type": "Character", "value": "', getCharacterName(charId), '" }',
                            ']',
                        '}'
                    )
                )
            )
        );

        // Tạo tokenURI
        string memory finalTokenURI = string(abi.encodePacked("data:application/json;base64,", json));

        // Mint NFT
        _safeMint(to, currentId);
        _setTokenURI(currentId, finalTokenURI);

        tokenId++;
    }

    function getCharacterName(uint256 index) internal pure returns (string memory) {
        if (index == 0) return "Elf";
        if (index == 1) return "Knight";
        if (index == 2) return "Orc";
        if (index == 3) return "Witch";
        return "Unknown";
    }
}
