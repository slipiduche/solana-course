import { createUmi } from '@metaplex-foundation/umi-bundle-defaults'
import { publicKey, generateSigner, none, Keypair, keypairIdentity, createSignerFromKeypair } from '@metaplex-foundation/umi'
import "dotenv/config";
import {
    fetchMerkleTree,
    fetchTreeConfigFromSeeds, mplBubblegum, createTree, mintV1,
    findLeafAssetIdPda,
    parseLeafFromMintV1Transaction,
    LeafSchema
} from '@metaplex-foundation/mpl-bubblegum'
import { base58 } from '@metaplex-foundation/umi/serializers';
const API = process.env.API_URL ?? 'http://localhost:8899'

const base58pk = process.env.account2pk
const base58sk = process.env.account2sk
const main = async () => {
    console.log('API:', API)
    console.log('base58pk:', base58pk)
    console.log('base58sk:', base58sk)
    const umi = createUmi(API).use(mplBubblegum())
    const merkleTree = generateSigner(umi)
    const keypair: Keypair = {
        publicKey: publicKey(base58pk ?? ''),
        secretKey: base58.serialize(base58sk ?? '')
    }
    console.log('keypair:', keypair)
    // Use the RPC endpoint of your choice.

    umi.use(keypairIdentity(createSignerFromKeypair(umi, keypair)))
    // // const merkleTree = await fetchMerkleTree(umi, merkleTreeAddress)
    // const builder = await createTree(umi, {
    //     merkleTree,
    //     maxDepth: 14,
    //     maxBufferSize: 64,
    // })
    // const { signature: treeSignature } = await builder.sendAndConfirm(umi)
    // console.log('treeSignature:', treeSignature)
    // const merkleTreeAddress = merkleTree.publicKey
    // const treeConfig = await fetchTreeConfigFromSeeds(umi, {
    //     merkleTree: merkleTreeAddress,
    // })
    // console.log('treeConfig:', treeConfig)
    // const { signature } = await mintV1(umi, {
    //     leafOwner: merkleTree.publicKey,
    //     merkleTree: merkleTreeAddress,
    //     metadata: {
    //         name: 'My Compressed NFT',
    //         uri: 'https://example.com/my-cnft.json',
    //         sellerFeeBasisPoints: 500, // 5%
    //         collection: none(),
    //         creators: [
    //             { address: umi.identity.publicKey, verified: false, share: 100 },
    //         ],
    //     },
    // }).sendAndConfirm(umi, { confirm: { commitment: 'confirmed' } })
    // console.log('signature:', signature)
    const signature = new Uint8Array(64)
    signature.set([
        253, 75, 90, 149, 212, 148, 29, 80, 107, 92, 157,
        149, 170, 178, 89, 125, 1, 165, 90, 250, 112, 58,
        88, 177, 129, 128, 214, 202, 251, 80, 56, 157, 208,
        200, 231, 44, 97, 108, 245, 9, 158, 222, 127, 31,
        182, 126, 202, 57, 69, 242, 236, 245, 119, 143, 71,
        194, 205, 18, 8, 230, 17, 192, 165, 2
    ])
    const merkleTreeAddress = publicKey('BJAH8xy7d4wBidbgseKmMNJtvpTpxDwmt4ZpZRGEy6iz')
    const leaf: LeafSchema = await parseLeafFromMintV1Transaction(umi, signature);
    console.log('leaf:', leaf)
    const assetId = findLeafAssetIdPda(umi, { merkleTree: merkleTreeAddress, leafIndex: leaf.nonce });
    console.log('assetId0:', assetId[0])
    console.log('assetId1:', assetId[1])
}
main()