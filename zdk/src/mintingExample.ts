import { promises as fs } from 'fs'
import { Zora } from './zora'
import { Wallet } from 'ethers'
import { JsonRpcProvider } from '@ethersproject/providers'
import {
  constructBidShares,
  constructMediaData,
  sha256FromBuffer,
  generateMetadata
} from './'
import dotenv from 'dotenv'

async function start(){
  const path = `/d/Projects/Zoragon/Zoragon/zdk/.env`
  await dotenv.config({ path });
  const provider = new JsonRpcProvider(process.env.RPC_ENDPOINT) // defaults to http://localhost:8545, but accepts eth node rpc url
  const wallet = new Wallet(`0x${process.env.PRIVATE_KEY}`, provider)
  const zora = new Zora(wallet, 80001)

  const metadataJSON = generateMetadata('zora-20210101', {
    description: 'NFT Hack Example',
    mimeType: 'text/plain',
    name: 'NFT HACK',
    version: 'zora-20210101',
  })

  const kanyeBuf = await fs.readFile('./ZoragonGenesis.png')
  const contentHash = sha256FromBuffer(kanyeBuf)
  const metadataHash = sha256FromBuffer(Buffer.from(metadataJSON))
  const mediaData = constructMediaData(
    'https://ipfs.io/ipfs/bafybeie7ezcxx7c7qomcuclmm6cxtrxyh5tbglwu3mfv2ld2cmqhiacoke',
    'https://ipfs.io/ipfs/bafybeiecl5xhe3zobwlyle2fz7oybknvoodgigm5ywjtnpb77xifwophu4',
    contentHash,
    metadataHash
  )

  
  const bidShares = constructBidShares(
    10, // creator share
    90, // owner share
    0 // prevOwner share
  )
  console.log("Minting...")
  const tx = await zora.mint(mediaData, bidShares)
  await tx.wait(8) // 8 confirmations to finalize
}

start().catch((e: Error) => {
  console.error(e);
  process.exit(1);
});
