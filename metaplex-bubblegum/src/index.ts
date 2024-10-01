import { createUmi } from '@metaplex-foundation/umi-bundle-defaults'
import { publicKey, generateSigner, Keypair, keypairIdentity, createSignerFromKeypair, percentAmount } from '@metaplex-foundation/umi'
import "dotenv/config";
import {
    mplBubblegum,
} from '@metaplex-foundation/mpl-bubblegum'
import { base58 } from '@metaplex-foundation/umi/serializers';
import { createCollectionNft, createNewTree, mintNFTToCollection } from './functions';
const API = process.env.API_URL ?? 'http://localhost:8899'

const base58pk = process.env.account2pk
const base58sk = process.env.account2sk
const umi = createUmi(API).use(mplBubblegum())
const merkleTree = generateSigner(umi)
const keypair: Keypair = {
    publicKey: publicKey(base58pk ?? ''),
    secretKey: base58.serialize(base58sk ?? '')
}
umi.use(keypairIdentity(createSignerFromKeypair(umi, keypair)))


const main = async () => {
    // const new_tree = await createNewTree({ umi, merkleTree })
    // console.log('new_tree:', new_tree)
    // const collection_metadata_data = {
    //     name: "NFNode on SOLANA",
    //     symbol: "NFN",
    //     // Arweave / IPFS / Pinata etc link using metaplex standard for off-chain data
    //     uri: "https://arweave.net/QSErXm9gmPLIi7XxKVy3ptXFvOODhRZjI7iDKa0gvxM",
    //     sellerFeeBasisPoints: percentAmount(0, 2)
    // };
    // const collection_nft = await createCollectionNft(umi, {
    //     ...collection_metadata_data
    // })
    // console.log('collection_nft:', collection_nft.collection_mint.publicKey.toString())
    // console.log('collection_nft_signature:', base58.deserialize(collection_nft.result.signature)[0])
    const collection_mint= 'ELaKaVVMWEErTByFNc5fnxGhagcLt6SBKusAyDCRF4eJ'
    const merkleTree= '4hQmS19sKrG957m8hr1piHYTnfTiWTt22VNoMEGGMUtF'//'Ekye5fyMeLDiwazPEKRT9HFtUm4eutSVKoFV58Pu6UVS'
    const leafOwner= 'FCap4kWAPMMTvAqUgEX3oFmMmSzg7g3ytxknYD21hpzm'
    const nft_medatada = {
        name: "NFNode #1",
        symbol: "NFN",
        uri: "https://arweave.net/QSErXm9gmPLIi7XxKVy3ptXFvOODhRZjI7iDKa0gvxM",
        sellerFeeBasisPoints: 0

    }
    // console.log('collection_mint:', collection_nft.collection_mint.publicKey.toString())
    // console.log('merkleTree:', new_tree.publicKey.toString())
    // console.log('leafOwner:', base58pk)

    const mint_nft_to_collection = await mintNFTToCollection(

        {
            umi,
            collectionMint: publicKey(collection_mint),
            merkleTree: publicKey(merkleTree),
            metadata: nft_medatada,
            leafOwner: publicKey(leafOwner),

        }
    )
    console.log('mint_nft_to_collection:', mint_nft_to_collection)
    console.log('mint_nft_to_collection_signature:', base58.deserialize(mint_nft_to_collection.signature)[0])

//3WirmbDWgfxrvvBZAeumzRekVkkDHevnc6TkivcDDxVRcDnXi8saE2cbs83mJHvdySKr7rDk2bSq5QHFpfGKfzW5
}
main()

