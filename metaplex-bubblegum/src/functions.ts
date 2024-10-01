import {
  KeypairSigner,
  Metaplex,
  toMetaplexFile,
} from "@metaplex-foundation/js"
import { createNft, mplTokenMetadata } from '@metaplex-foundation/mpl-token-metadata'
import { generateSigner, Umi, percentAmount, Amount, Signer, PublicKey, Pda, publicKey } from "@metaplex-foundation/umi"
import * as fs from "fs"
import { createTree, fetchTreeConfigFromSeeds, mintToCollectionV1, mplBubblegum } from "@metaplex-foundation/mpl-bubblegum"
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

export const createNewTree = async ({ umi, merkleTree, maxDepth = 14, maxBufferSize = 64 }: { umi: Umi, merkleTree: Signer, maxDepth?: number, maxBufferSize?: number }) => {
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
  return treeConfig
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