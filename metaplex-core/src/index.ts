import { createUmi } from '@metaplex-foundation/umi-bundle-defaults'
import { createV1, mplCore, create, createCollection, fetchCollection, DataState } from '@metaplex-foundation/mpl-core'
import { fetchAssetV1 } from '@metaplex-foundation/mpl-core'
import { generateSigner, percentAmount, createSignerFromKeypair, keypairIdentity, Keypair, PublicKey, publicKey, } from '@metaplex-foundation/umi'
import { getKeypairFromEnvironment } from '@solana-developers/helpers';
import "dotenv/config";
import { base58 } from '@metaplex-foundation/umi/serializers';
const API = process.env.API_URL ?? 'http://localhost:8899'
const keypairHelper = getKeypairFromEnvironment("SK")
const keypair: Keypair = {
  publicKey: publicKey(keypairHelper.publicKey),
  secretKey: keypairHelper.secretKey
}

async function main() {
  // Use the RPC endpoint of your choice.
  const umi = createUmi(API).use(mplCore())
  umi.use(keypairIdentity(createSignerFromKeypair(umi, keypair)))

  // const collectionAddress = generateSigner(umi)
  // const collectionNFT = await createCollection(umi, {
  //   collection: collectionAddress,
  //   name: 'NFNodes',
  //   uri: "https://arweave.net/QSErXm9gmPLIi7XxKVy3ptXFvOODhRZjI7iDKa0gvxM",
  //   updateAuthority: keypair.publicKey
  // }).sendAndConfirm(umi)

  // const collection = await fetchCollection(umi, '3j1phpDkdVnqdgS42Y4oj8Q5xHP6ow3Ekeu6guW2ngtF')
  const collection = await fetchCollection(umi, 'G1cfvjTbqMnV4PWaKMiSxNjeVAbg3suDbyBrs6yHV3K')
  const assetAddress = generateSigner(umi)
  const result = await create(umi, {
    collection: collection,
    asset: assetAddress,
    name: 'NFNoncollectionCore',
    uri: "https://arweave.net/QSErXm9gmPLIi7XxKVy3ptXFvOODhRZjI7iDKa0gvxM",
    owner: publicKey('G37BbUMZU3NgMZkHVLMWcFGQZwTJ455824Ps55rPRMfv'),
  }).sendAndConfirm(umi)
  console.log('result:', result.result)
  console.log(
    `Create Transaction: https://explorer.solana.com/tx/${base58.deserialize(result.signature)[0]}?cluster=devnet`,
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