import { createUmi } from '@metaplex-foundation/umi-bundle-defaults'
import { publicKey, generateSigner, Keypair, keypairIdentity, createSignerFromKeypair, percentAmount } from '@metaplex-foundation/umi'
import "dotenv/config";
import {
    findLeafAssetIdPda,
    LeafSchema,
    mplBubblegum,
    parseLeafFromMintV1Transaction,
} from '@metaplex-foundation/mpl-bubblegum'
import { base58 } from '@metaplex-foundation/umi/serializers';
import { createCollectionNft, createNewTree, mintNFTToCollection, fetchAssetIDWithMerkleTreeAndLeafIndex, fetchNFTMetadataWithAssetID, getSolanaTxInfo, verifyPayments } from './functions';
import { VersionedTransactionResponse } from '@solana/web3.js';
const API = process.env.API_URL ?? 'http://localhost:8899'

const base58pkdelegate = process.env.accountpk
const base58skdelegate = process.env.accountsk
// const base58pk = process.env.account2pk
// const base58sk = process.env.account2sk
const umi = createUmi(API).use(mplBubblegum())
const keypair: Keypair = {
    publicKey: publicKey(base58pkdelegate ?? ''),
    secretKey: base58.serialize(base58skdelegate ?? '')
}
umi.use(keypairIdentity(createSignerFromKeypair(umi, keypair)))


const main = async () => {
    // const merkleTree = generateSigner(umi)
    // console.log('merkleTree:', merkleTree.publicKey.toString())
    // const new_tree = await createNewTree({ umi, merkleTree,  })
    // console.log('new_tree:', new_tree)
    // const collection_metadata_data = {
    //     name: "NFNodes",
    //     symbol: "NFN",
    //     // Arweave / IPFS / Pinata etc link using metaplex standard for off-chain data
    //     uri: "https://arweave.net/QSErXm9gmPLIi7XxKVy3ptXFvOODhRZjI7iDKa0gvxM",
    //     sellerFeeBasisPoints: percentAmount(0, 2),
    // };
    // const collection_nft = await createCollectionNft(umi, {
    //     ...collection_metadata_data
    // })
    // console.log('collection_nft:', collection_nft.collection_mint.publicKey.toString())
    // console.log('collection_nft_signature:', base58.deserialize(collection_nft.result.signature)[0])
    // // const collection_mint = 'GuZ9VQyincE1UNKM1mGBJ7FAGRt2WWFSWHJmYU6puFBX'
    // // const merkle_tree_address = 'G3K5AvqkkYdzY5wRfYZbKXSHAf75MY6oBYuBkXzero92'//'Ekye5fyMeLDiwazPEKRT9HFtUm4eutSVKoFV58Pu6UVS'
    // // const leafOwner = 'FCap4kWAPMMTvAqUgEX3oFmMmSzg7g3ytxknYD21hpzm'
    // const nft_medatada = {
    //     name: "NFNode #1",
    //     symbol: "NFN",
    //     uri: "https://arweave.net/QSErXm9gmPLIi7XxKVy3ptXFvOODhRZjI7iDKa0gvxM",
    //     sellerFeeBasisPoints: 0

    // }
    // console.log('collection_mint:', collection_nft.collection_mint.publicKey.toString())
    // console.log('merkleTree:', new_tree.merkleTree.publicKey.toString())
    // console.log('leafOwner:', leafOwner)

    // const mint_nft_to_collection = await mintNFTToCollection(

    //     {
    //         umi,
    //         collectionMint: publicKey(collection_nft.collection_mint.publicKey.toString()),
    //         merkleTree: publicKey(new_tree.merkleTree.publicKey.toString()),
    //         metadata: nft_medatada,
    //         leafOwner: publicKey(leafOwner),

    //     }
    // )
    // console.log('mint_nft_to_collection:', mint_nft_to_collection)
    // console.log('mint_nft_to_collection_signature:', base58.deserialize(mint_nft_to_collection.signature)[0])

    // const signature='5yHtdnJ8HHnxrMN3aEYQNtsQfPPFqeRzqXzswrL8LhuLvQqibPWwfXKxWDgNwSn5DmDg8iMQQJcmQahLbCM6mnQ7'
    // const leaf: LeafSchema = await parseLeafFromMintV1Transaction(umi, base58.serialize(signature));
    // console.log('leaf:', leaf)
    // const assetId = findLeafAssetIdPda(umi, { merkleTree: publicKey('CeqpwPwG6jZb7piYthHb512HntM3VZPWxnY63qYE6BcB'), leafIndex: leaf.nonce });
    // console.log('assetId0:', assetId[0])
    // console.log('assetId1:', assetId[1])
    // // const assetId = '8v6sUPE79JfZLbMsB4ByDNYcVyyh2yk2Xt96yD3dPVoc'
    // const leafAssetIndex = leaf.nonce
    // const nft_medatada_asset_id = await fetchNFTMetadataWithAssetID(umi, publicKey(assetId[0]))
    // console.log('nft_medatada_asset_id:', nft_medatada_asset_id)
    // const nft_medatada_merkle_tree_leaf_index = await fetchAssetIDWithMerkleTreeAndLeafIndex(umi, publicKey('CeqpwPwG6jZb7piYthHb512HntM3VZPWxnY63qYE6BcB'), leafAssetIndex)
    // console.log('nft_medatada_merkle_tree_leaf_index:', nft_medatada_merkle_tree_leaf_index)



    const amounts = [0, 5000]
    //const amounts = [5000,0 ]
    const accounts = ['EUr1rKsxgcSXFe1qgjRkeCqWakZwWWykWhv4pEU6c8DG', 'NFNDevuQj3z4uMNN86k2PgnbGWdpoApbXwtTMY6B99F']
    // const accounts = ['NFNDevuQj3z4uMNN86k2PgnbGWdpoApbXwtTMY6B99F', 'EUr1rKsxgcSXFe1qgjRkeCqWakZwWWykWhv4pEU6c8DG']
    const signature = '9kA5u6RN3hCiQ3HRypUMtdZGoX74p614up7ZC5MRZgCc8D56LQ4jQUZsdPdbHdWseirAzE8ozCfNkBkgtHrGnvE'
    const result = await verifyPayments(signature, accounts, amounts);
    console.log('result:', result)
}
main()

