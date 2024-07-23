import { initializeKeypair } from "./initializeKeypair"
import { Connection, clusterApiUrl } from "@solana/web3.js"
import {
  Metaplex,
  keypairIdentity,
  bundlrStorage,
} from "@metaplex-foundation/js"
import { createCollectionNft, createNft, updateNftUri, uploadMetadata } from "./functions"




// example data for a new NFT
const nftData = {
  name: "Name",
  symbol: "SYMBOL",
  description: "Description",
  sellerFeeBasisPoints: 0,
  imageFile: "genesis.svg",
}

// example data for updating an existing NFT
const updateNftData = {
  "name": "liquid-bronze-quokka",
  "symbol": "NFN",
  "description": "NFN corresponds to a unique, active hotspot within the Wayru network and is minted by hotspot operators as they join the network.",
  "image": "https://ipfs.algonode.xyz/ipfs/bafybeibfhe2nuejixwxeikiys4wvp4vajn6f7bwtrppoa3anbrwc3o7k6u",
  "image_integrity": "sha256-CxCjHltLBVx11iQ81n4BTCpjilo9pb77x5kCK7Qgnss=",
  "image_mimetype": "image/png",
  "external_url": "https://docs.wayru.io/fundamentals/non-fungible-node",
  "cid_version": 1,
  "properties": {
    "Model": "Genesis",
    "Status": "active",
    "Mac": "40:A5:EF:B9:B9:65",
    "Id": "ef787c438ef54be0bf7ec111a9f4a6a8test",
    "Os_version": "22.0.4",
    "Os_services_version": "1.4.0",
    "Latitude": "11.431903970634712",
    "Longitude": "-85.82715281929103",
    "UserId": 816,
    "PlanType": "HotspotOwner",
    "Owner": "0x58118258ee2D83E3F9C6F7c6593048D58180dbc2",
    "Host": "0x58118258ee2D83E3F9C6F7c6593048D58180dbc2",
    "Type": "Operator",
    "TotalUptime": "0",
    "totalGigabytes": "0",
    "TotalRewardsEarned": "0",
    "PendingRewards": "0",
    "LastPeriodRewardsEarned": "0",
    "LastPeriodMegaBytes": "0",
    "LastReportedBandwidth": "0",
    "LastReportedUptime": "Thu Jul 11 2024 18:47:24 GMT-0400 (Venezuela Time)",
    "LastPeriodTierLevel": "5",
    "LastMetadataUpdatedDate": "Thu Jul 11 2024 18:47:24 GMT-0400 (Venezuela Time)",
    "CreatedAt": "Thu Jul 11 2024 18:47:24 GMT-0400 (Venezuela Time)"
  }
}


async function main() {
  // create a new connection to the cluster's API
  const connection = new Connection(clusterApiUrl("devnet"));

  // initialize a keypair for the user
  const user = await initializeKeypair(connection);

  console.log("PublicKey:", user.publicKey.toBase58());

  // metaplex set up
  const metaplex = Metaplex.make(connection)
    .use(keypairIdentity(user))
    .use(
      bundlrStorage({
        address: "https://devnet.bundlr.network",
        providerUrl: "https://api.devnet.solana.com",
        timeout: 60000,
      }),
    );


  const collectionNftData = {
    name: "NFNodes",
    symbol: "NFN",
    description: "NFN corresponds to a unique, active hotspot within the Wayru network and is minted by hotspot operators as they join the network.",
    sellerFeeBasisPoints: 100,
    "image": "https://ipfs.algonode.xyz/ipfs/bafybeibfhe2nuejixwxeikiys4wvp4vajn6f7bwtrppoa3anbrwc3o7k6u",
    // imageFile: "success.png",
    isCollection: true,
    collectionAuthority: user,
  }
  // upload data for the collection NFT and get the URI for the metadata
  const collectionUri = await uploadMetadata(metaplex, collectionNftData)
  // create a collection NFT using the helper function and the URI from the metadata
  const collectionNft = await createCollectionNft(
    metaplex,
    collectionUri,
    collectionNftData
  )

  // upload the NFT data and get the URI for the metadata
  const uri = await uploadMetadata(metaplex, nftData)

  // create an NFT using the helper function and the URI from the metadata
  const nft = await createNft(metaplex, uri, nftData, collectionNft.address)

  // upload updated NFT data and get the new URI for the metadata
  const updatedUri = await uploadMetadata(metaplex, updateNftData)

  // update the NFT using the helper function and the new URI from the metadata
  await updateNftUri(metaplex, updatedUri, nft.address, updateNftData.name, updateNftData.symbol)

  //this is what verifies our collection as a Certified Collection
  await metaplex.nfts().verifyCollection({  
    mintAddress: nft.mint.address,
    collectionMintAddress: collectionNft.address,
    isSizedCollection: true,
  })


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
