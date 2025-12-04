import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";

describe("real_estate_fractionalizer - tests (skeleton)", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.local();
  anchor.setProvider(provider);

  const program = anchor.workspace.RealEstateFractionalizer as Program;

  it("initializes a property account (skeleton)", async () => {
    // TODO: This test is a skeleton. Complete it with proper mint creation,
    // NFT deposit and CPI flows. The purpose is to provide the basic test
    // harness to extend for full end-to-end tests requested.
    const authority = provider.wallet.publicKey;

    // Example seeds/pdas used by the program; replace with actual logic
    // when adding token creation CPIs.

    // const nftMint = ...
    // const fractionMint = ...

    // await program.methods
    //   .initializeProperty("ipfs://...", new anchor.BN(1_000_000), 0)
    //   .accounts({
    //     propertyAccount: propertyPda,
    //     authority,
    //     nftMint,
    //     fractionMint,
    //     systemProgram: anchor.web3.SystemProgram.programId,
    //   })
    //   .rpc();

    // For now, just assert the program object exists.
    if (!program) throw new Error("Program not loaded");
  });
});
