import { createUmi } from '@metaplex-foundation/umi-bundle-defaults'
import { createV1, mplCore, create, createCollection, fetchCollection, DataState } from '@metaplex-foundation/mpl-core'
import { fetchAssetV1 } from '@metaplex-foundation/mpl-core'
import { generateSigner, percentAmount, createSignerFromKeypair, keypairIdentity, Keypair, PublicKey, publicKey, } from '@metaplex-foundation/umi'
import { getKeypairFromEnvironment } from '@solana-developers/helpers';
import "dotenv/config";
import { base58 } from '@metaplex-foundation/umi/serializers';
import { Keypair as KeypairHelper } from '@solana/web3.js';
import * as bip39 from 'bip39'
import { HDKey } from "micro-ed25519-hdkey";
const API = process.env.API_URL ?? 'http://localhost:8899'
const base58key = process.env.sk2
const mnemonic = process.env.mnemonic_prod
const keypairHelper = getKeypairFromEnvironment("WAYRU_SK")
const keypair: Keypair = {
  publicKey: publicKey(keypairHelper.publicKey),
  secretKey: keypairHelper.secretKey
}

async function main() {
  console.log('PROD_PK:', keypairHelper.publicKey.toBase58())
  console.log('PROD_SK:', keypairHelper.secretKey)
  console.log('PROD_SK_base58:', base58.deserialize(keypairHelper.secretKey)[0])
  const keypairfrombase68string = KeypairHelper.fromSeed(base58.serialize(base58.deserialize(keypairHelper.secretKey)[0]).slice(0, 32))
  console.log('keypair.pk:',keypairfrombase68string.publicKey.toBase58())
  console.log('keypair.sk:',keypairfrombase68string.secretKey)
  console.log('base58:', base58key)
  console.log('base58 serialize:', base58.serialize(base58key ?? ''))
  console.log('mnemonic:', mnemonic)
  console.log('key from mnemonic:', (bip39.mnemonicToSeedSync(mnemonic ?? '').slice(0, 32)))
  console.log('keypair:', KeypairHelper.fromSeed(bip39.mnemonicToSeedSync(mnemonic ?? '').slice(0, 32)))
  console.log('sk:', KeypairHelper.fromSeed(bip39.mnemonicToSeedSync(mnemonic ?? '').slice(0, 32)).secretKey)
  console.log('base58sk:', base58.deserialize(KeypairHelper.fromSeed(bip39.mnemonicToSeedSync(mnemonic ?? '').slice(0, 32)).secretKey))
  const seed = bip39.mnemonicToSeedSync(mnemonic ?? '');
  const hd = HDKey.fromMasterSeed(seed.toString("hex"));

  for (let i = 0; i < 10; i++) {
    const path = `m/44'/501'/${i}'/0'`;
    const keypair = KeypairHelper.fromSeed(hd.derive(path).privateKey);
    console.log(`${path} => ${keypair.publicKey.toBase58()} - ${base58.deserialize(keypair.secretKey)}`);
  }
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