import { createUmi } from '@metaplex-foundation/umi-bundle-defaults'
import { createV1, mplCore, create, createCollection, fetchCollection, DataState, update, transfer } from '@metaplex-foundation/mpl-core'
import { fetchAssetV1 } from '@metaplex-foundation/mpl-core'
import { generateSigner, percentAmount, createSignerFromKeypair, keypairIdentity, Keypair, PublicKey, publicKey, Umi, } from '@metaplex-foundation/umi'
import { getKeypairFromEnvironment } from '@solana-developers/helpers';
import "dotenv/config";
import { base58 } from '@metaplex-foundation/umi/serializers';
import { Keypair as KeypairHelper } from '@solana/web3.js';
import * as bip39 from 'bip39'
import { HDKey } from "micro-ed25519-hdkey";
const API = process.env.API_URL ?? 'http://localhost:8899'
const base58pk = process.env.account2pk
const base58sk = process.env.account2sk
const mnemonic = process.env.mnemonic
const getKeypair = (mnemonic: string, path_index = 0): Keypair => {
  const seed = bip39.mnemonicToSeedSync(mnemonic ?? '');
  const hd = HDKey.fromMasterSeed(seed.toString("hex"));

  const path = `m/44'/501'/${path_index}'/0'`;
  const keypair = KeypairHelper.fromSeed(hd.derive(path).privateKey);
  console.log(`${path} => ${keypair.publicKey.toBase58()} - ${base58.deserialize(keypair.secretKey)}`);
  return {
    publicKey: publicKey(keypair.publicKey),
    secretKey: keypair.secretKey
  }

}
const umi = createUmi(API).use(mplCore())
const createNewCollection = async (umi: Umi, keypair: Keypair) => {
  const collection_address = generateSigner(umi)
  // Create a collection
  const collection_nft = await createCollection(umi, {
    collection: collection_address,
    name: 'NFNodes2',
    uri: "https://arweave.net/QSErXm9gmPLIi7XxKVy3ptXFvOODhRZjI7iDKa0gvxM",
    updateAuthority: keypair.publicKey
  }).sendAndConfirm(umi)

  return { address: collection_address.publicKey, sk: base58.deserialize(collection_address.secretKey)[0], signature: base58.deserialize(collection_nft.signature)[0] }
}
const createNft = async (umi: Umi, collection_address?: string) => {
  const collection = collection_address ? await fetchCollection(umi, collection_address) : undefined
  const assetAddress = generateSigner(umi)
  const result = await create(umi, {
    collection,
    asset: assetAddress,
    name: 'NFNoncollectionCore',
    uri: "https://arweave.net/QSErXm9gmPLIi7XxKVy3ptXFvOODhRZjI7iDKa0gvxM",
    owner: publicKey('FCap4kWAPMMTvAqUgEX3oFmMmSzg7g3ytxknYD21hpzm'),
  }).sendAndConfirm(umi)
  if (result?.result?.context?.slot
  ) {
    console.log('NFT created successfully')
    return { assetAddress: assetAddress.publicKey, signature: result.signature }
  } else {
    console.log('NFT creation failed')
  }
}
const updateNftMetadata = async (umi: Umi, asset_address: string, uri: string, collection_address: string) => {
  const asset = await fetchAssetV1(umi, publicKey(asset_address))
  const collection = collection_address ? await fetchCollection(umi, collection_address) : undefined
  const result = await update(umi, {
    asset: asset,
    collection,
    uri: uri,

  }).sendAndConfirm(umi)
  if (result?.result?.context?.slot
  ) {
    console.log('NFT UPDATED successfully')
    return { asset_address, signature: result.signature }
  } else {
    console.log('NFT edition failed')
  }
}
const transferNFT = async (umi: Umi, asset_address: string, new_owner: string, collection_address: string) => {
  const asset = await fetchAssetV1(umi, publicKey(asset_address))
  const collection = collection_address ? await fetchCollection(umi, collection_address) : undefined
  const result = await transfer(umi, {
    asset,
    newOwner: publicKey(new_owner),
    collection,
  }).sendAndConfirm(umi)
  if (result?.result?.context?.slot
  ) {
    console.log('NFT Trensferred successfully')
    return { asset_address, signature: result.signature }
  } else {
    console.log('NFT transfer failed')
  }
}
async function main() {

  // const keypair = getKeypair(mnemonic2 ?? '', 0)
  const keypair: Keypair = {
    publicKey: publicKey(base58pk ?? ''),
    secretKey: base58.serialize(base58sk ?? '')
  }

  // Use the RPC endpoint of your choice.

  umi.use(keypairIdentity(createSignerFromKeypair(umi, keypair)))

  // const collection = await createNewCollection(umi, keypair)
  // console.log('collection:', collection)

  // const result = await createNft(umi,'2ni9vvi2EtwxZSBzeJAbrmSQkjLDYxkq3PW62qp4QQTB')
  // updateNft 
  // const result = await updateNftMetadata(umi, '5oMQQctP61rRUVvgHD1QnhAwZQwDz5HVXCLLJw2pBsBp', 'https://ipfs.algonode.xyz/ipfs/QmYi81K8FPEn4R81SYNCY4xRNLeQCtXvEqaY3xpmwnSP19', '2ni9vvi2EtwxZSBzeJAbrmSQkjLDYxkq3PW62qp4QQTB')
  // transfer
  const result = await transferNFT(umi, '5oMQQctP61rRUVvgHD1QnhAwZQwDz5HVXCLLJw2pBsBp', 'G37BbUMZU3NgMZkHVLMWcFGQZwTJ455824Ps55rPRMfv', '2ni9vvi2EtwxZSBzeJAbrmSQkjLDYxkq3PW62qp4QQTB')

  console.log(
    `Create Transaction: https://explorer.solana.com/tx/${result ? base58.deserialize(result.signature)[0] : ''}?cluster=devnet`,
  );
}
main()
  .then(() => {
    console.log("Finished successfully")
    process.exit(0)
  })
  .catch((error) => {
    console.log(error)
    process.exit(1)
  })