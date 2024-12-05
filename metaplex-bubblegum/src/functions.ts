import {
  KeypairSigner,
  Metaplex,
  toMetaplexFile,
} from "@metaplex-foundation/js"
import { createNft, mplTokenMetadata } from '@metaplex-foundation/mpl-token-metadata'
import { generateSigner, Umi, percentAmount, Amount, Signer, PublicKey, Pda, publicKey } from "@metaplex-foundation/umi"
import * as fs from "fs"
import { createTree, fetchTreeConfigFromSeeds, mintToCollectionV1, mplBubblegum, findLeafAssetIdPda, updateMetadata, MetadataArgsArgs } from "@metaplex-foundation/mpl-bubblegum"
import { dasApi } from '@metaplex-foundation/digital-asset-standard-api';
import { base58 } from '@metaplex-foundation/umi/serializers';

interface NftData {
  name: string
  symbol: string
  description: string
  sellerFeeBasisPoints: number
  imageFile: string
}

interface CollectionNftData {
  name: string,
  uri: string,
  sellerFeeBasisPoints: Amount<'%', 2>,
  symbol?: string
  updateAuthority?: PublicKey
}
interface OnCollectionNftMetadata {
  name: string;
  uri: string;
  sellerFeeBasisPoints: number;
}
// helper function to upload image and metadata
export async function uploadMetadata(
  metaplex: Metaplex,
  nftData: any,
): Promise<string> {
  let imageUri: string
  if (nftData.image) {
    imageUri = nftData.image
  } else {
    // file to buffer
    const buffer = fs.readFileSync("src/" + nftData.imageFile);
    // buffer to metaplex file
    const file = toMetaplexFile(buffer, nftData.imageFile);

    // upload image and get image uri
    imageUri = await metaplex.storage().upload(file);
    console.log("image uri:", imageUri);
  }


  // upload metadata and get metadata uri (off chain metadata)
  const { uri } = await metaplex.nfts().uploadMetadata({
    name: nftData.name,
    symbol: nftData.symbol,
    description: nftData.description,
    image: imageUri,
  });

  console.log("metadata uri:", uri);
  return uri;
}


export const createCollectionNft = async (umi: Umi, data: CollectionNftData) => {
  umi.use(mplTokenMetadata())
  const collection_mint = generateSigner(umi)
  return {
    result: await createNft(umi, {
      ...data,
      mint: collection_mint,
      isCollection: true,
      isMutable: true,
    }).sendAndConfirm(umi), collection_mint
  }
}
import { setTreeDelegate } from '@metaplex-foundation/mpl-bubblegum'
import { clusterApiUrl, Connection } from "@solana/web3.js"



export const createNewTree = async ({ umi, merkleTree, treeDelegate, maxDepth = 14, maxBufferSize = 64 }: { umi: Umi, merkleTree: Signer, treeDelegate?: PublicKey, maxDepth?: number, maxBufferSize?: number }) => {
  const tree = await createTree(umi, {
    merkleTree,
    maxDepth,
    maxBufferSize,

  })
  umi.use(mplBubblegum())
  const { signature: treeSignature } = await tree.sendAndConfirm(umi)
  console.log('treeSignature:', treeSignature)
  const merkleTreeAddress = merkleTree.publicKey
  const treeConfig = await fetchTreeConfigFromSeeds(umi, {
    merkleTree: merkleTreeAddress,
  })
  console.log('treeConfig:', treeConfig)
  return { merkleTree, treeConfig, delegateSignature: undefined }
  // try {
  //   const delegateSignature = await setTreeDelegate(umi, {
  //     merkleTree: merkleTreeAddress,
  //     treeCreator: umi.identity,
  //     newTreeDelegate: treeDelegate,
  //   }).sendAndConfirm(umi)
  //   return { merkleTree, treeConfig, delegateSignature }
  // } catch (error) {
  //   return { merkleTree, treeConfig, delegateSignature: undefined }

  // }
}

export const mintNFTToCollection = async ({ umi, collectionMint, metadata, merkleTree, leafOwner }: { umi: Umi, merkleTree: PublicKey | Pda, metadata: OnCollectionNftMetadata, collectionMint: PublicKey | Pda, leafOwner: PublicKey | Pda }) => {
  umi.use(mplBubblegum())
  const result = await mintToCollectionV1(umi, {
    leafOwner,
    merkleTree,
    collectionMint,
    metadata: {
      ...metadata,
      collection: { key: publicKey(collectionMint.toString()), verified: false },
      creators: [
        { address: umi.identity.publicKey, verified: false, share: 100 },
      ],

    },
  }).sendAndConfirm(umi)
  return result
}
export const fetchNFTMetadataWithAssetID = async (umi: Umi, assetId: PublicKey) => {
  umi.use(dasApi())
  const rpcAsset = await umi.rpc.getAsset(assetId)
  return rpcAsset
}
export const fetchAssetIDWithMerkleTreeAndLeafIndex = async (umi: Umi, merkleTree: PublicKey, leafIndex: number | bigint) => {
  const result = await findLeafAssetIdPda(umi, {
    merkleTree,
    leafIndex,
  })
  return result
}
export const getSolanaTxInfo = async (signature: string) => {
  const connection = new Connection(process.env.API_URL ?? clusterApiUrl('mainnet-beta'));
  let tx, counter = 0
  while (!tx && counter < 100) {
    tx = await connection.getTransaction(signature, {
      maxSupportedTransactionVersion: 0,
    });
    counter++
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  return tx
}
export const verifyPayments = async (
  signature: string,
  accounts: string[],
  amounts: number[],

): Promise<{ success: boolean, details: { account: string; change: number; type: 'payer' | 'receiver' | 'unchanged' }[] }> => {

  const tx_info = await getSolanaTxInfo(signature)
  console.log('tx_info:', tx_info)
  const base58_accounts = tx_info?.transaction.message.staticAccountKeys.map(item => item.toBase58())
  const pre_balances = tx_info?.meta?.preBalances
  const post_balances = tx_info?.meta?.postBalances
  if (!pre_balances || !post_balances || !base58_accounts) {
    return { success: false, details: [] }
  }
  const details = base58_accounts.map((account, index) => {
    const change = Math.abs(post_balances[index] - pre_balances[index]);
    let type: 'payer' | 'receiver' | 'unchanged'

    if (post_balances[index] < pre_balances[index]) {
      type = 'payer';
    } else if (post_balances[index] > pre_balances[index]) {
      type = 'receiver';
    } else {
      type = 'unchanged';
    }

    return { account, change, type };
  });
  console.log('details:', details)
  const success = accounts.every((account, index) => {
    const detail = details.find(d => d.account === account);
    return detail ? detail.change >= amounts[index] : false;
  });
  console.log('success:', success)
  return { success, details };
}

const updateNFTMetadata = async ({ umi, currentMetadata, metadataUrl, leafOwner, leafId, merkleTree }: { umi: Umi, currentMetadata: MetadataArgsArgs, metadataUrl: string, leafId: number, leafOwner: PublicKey | Pda, merkleTree: PublicKey | Pda }) => {

  const updated = await updateMetadata(umi, {
    index: leafId,
    nonce: leafId,
    leafOwner: leafOwner,
    merkleTree: merkleTree,
    root: base58.serialize(merkleTree[0]),
    currentMetadata: currentMetadata,
    updateArgs: {
      uri: metadataUrl
      
    }

  }).sendAndConfirm(umi)
}