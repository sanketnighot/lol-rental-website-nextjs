import Lands from './land.json'
import Lords from './lord.json'
const { MerkleTree } = require("merkletreejs");
const keccak256 = require("keccak256");


export const landMerkle = (x, y, category) => {
    let leaves = Lands.map(addr => keccak256(addr))
    let merkleTree = new MerkleTree(leaves, keccak256, {sortPairs: true})
    const rootHash = merkleTree.getHexRoot()
    console.log("Land: ", rootHash);
    let prove = `${x},${y},${category}` // The input
    
    let hashedAddress = keccak256(prove)
    let proof = merkleTree.getHexProof(hashedAddress)
    // console.log(proof)
    return(proof);
}

export const lordMerkle = (id, category) => {
    let leaves = Lords.map(addr => keccak256(addr))
    let merkleTree = new MerkleTree(leaves, keccak256, {sortPairs: true})
    const rootHash = merkleTree.getHexRoot()
    console.log("Lord: ", rootHash);
    let prove = `${id},${category}` // The input
    let hashedAddress = keccak256(prove)
    let proof = merkleTree.getHexProof(hashedAddress)
    return(proof);
}
