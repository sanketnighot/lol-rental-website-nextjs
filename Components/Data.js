import { Alchemy, Network } from "alchemy-sdk";
import {landContractAddress, lordContractAddress} from './HomePage';

const config = {
	apiKey: "4Yu3Crvr9V7owxJ-msc99y94RTQjKEB-",
	network: Network.ETH_MAINNET,
};

// const config = {
//     apiKey: "WYMOWU7-dcSmZGlHOMwdgJHm8-MpyMx6",
//     network: Network.ETH_GOERLI,
// };
const alchemy = new Alchemy(config);

export const getNFTs = async (address) => {
	// Get all NFTs
	const nfts = await alchemy.nft.getNftsForOwner(address);
	// Print NFTs
	const allNfts = nfts.ownedNfts;
	const lands = []
	const landsCategory = []
	const lords = []
	const lordsCategory = []
	// console.log(allNfts)
  for (const nft in allNfts) {
    const contractAdd = allNfts[nft].contract.address
    // console.log(contractAdd)
    if (contractAdd === landContractAddress) {
        // console.log(allNfts[nft])
        lands.push(allNfts[nft])
    } else if (contractAdd === lordContractAddress) {
        // console.log(allNfts[nft])
        lords.push(allNfts[nft])
    }
  }
//   console.log(lands) 
  return [lands,lords]
};
