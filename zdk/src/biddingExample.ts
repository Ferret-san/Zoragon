import { Zora, constructBid, Decimal, approveERC20 } from './'
import { Wallet } from 'ethers'
import { MaxUint256 } from '@ethersproject/constants'
import { JsonRpcProvider } from '@ethersproject/providers'
import dotenv from 'dotenv'


async function start(){
    const matic = '0x0000000000000000000000000000000000001010'
    const path = `/d/Projects/Zoragon/Zoragon/zdk/.env`
    await dotenv.config({ path });
    const provider = new JsonRpcProvider(process.env.RPC_ENDPOINT) // defaults to http://localhost:8545, but accepts eth node rpc url
    const wallet = new Wallet(`0x${process.env.PRIVATE_KEY}`, provider)
    const zora = new Zora(wallet, 80001)

    // grant approval
    await approveERC20(wallet, matic, zora.marketAddress, MaxUint256)

    const bid = constructBid(
    matic, // currency
    Decimal.new(0.5).value, // amount 0.5*10^18
    wallet.address, // bidder address
    wallet.address, // recipient address (address to receive Media if bid is accepted)
    10 // sellOnShare
    )

    const tx = await zora.setBid(1, bid)
    await tx.wait(8) // 8 confirmations to finalize
}

start().catch((e: Error) => {
    console.error(e);
    process.exit(1);
  });