import {
  Metaplex,
  toMetaplexFile,
  NftWithToken,
} from "@metaplex-foundation/js"
import { Signer, PublicKey } from "@solana/web3.js"
import * as fs from "fs"
interface NftData {
  name: string
  symbol: string
  description: string
  sellerFeeBasisPoints: number
  imageFile: string
}

interface CollectionNftData {
  name: string
  symbol: string
  description: string
  sellerFeeBasisPoints: number
  imageFile: string
  isCollection: boolean
  collectionAuthority: Signer
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

// helper function create NFT
export async function createNft(
  metaplex: Metaplex,
  uri: string,
  nftData: NftData,
  collection?: PublicKey
): Promise<NftWithToken> {
  const { nft } = await metaplex.nfts().create(
    {
      uri: uri, // metadata URI
      name: nftData.name,
      sellerFeeBasisPoints: nftData.sellerFeeBasisPoints,
      symbol: nftData.symbol,
      collection
    },
    { commitment: "finalized" },
  );

  console.log(
    `Token Mint: https://explorer.solana.com/address/${nft.address.toString()}?cluster=devnet`,
  );

  return nft;
}
// helper function update NFT
export async function updateNftUri(
  metaplex: Metaplex,
  uri: string,
  mintAddress: PublicKey,
  name?: string,
  symbol?: string
) {
  // fetch NFT data using mint address
  const nft = await metaplex.nfts().findByMint({ mintAddress });

  // update the NFT metadata
  const { response } = await metaplex.nfts().update(

    {
      symbol: symbol ?? nft.symbol,
      name: name ?? nft.name,
      nftOrSft: nft,
      uri: uri,
    },
    { commitment: "finalized" },
  );
  const updatedNft = await metaplex.nfts().refresh(nft);

  console.log(
    `Token Mint: https://explorer.solana.com/address/${nft.address.toString()}?cluster=devnet`,
  );

  console.log(
    `Transaction: https://explorer.solana.com/tx/${response.signature}?cluster=devnet`,
  );
  console.log(
    `Updated nft: https://explorer.solana.com/address/${updatedNft.address.toString()}?cluster=devnet`,
  );
}
export async function createCollectionNft(
  metaplex: Metaplex,
  uri: string,
  data: any
): Promise<NftWithToken> {
  const { nft } = await metaplex.nfts().create(
    {
      uri: uri,
      name: data.name,
      sellerFeeBasisPoints: data.sellerFeeBasisPoints,
      symbol: data.symbol,
      isCollection: true,
    },
    { commitment: "finalized" }
  )

  console.log(
    `Collection Mint: https://explorer.solana.com/address/${nft.address.toString()}?cluster=devnet`
  )

  return nft
}