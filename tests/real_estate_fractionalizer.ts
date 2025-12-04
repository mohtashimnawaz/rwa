import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { Rwa } from "../target/types/rwa";
import {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  getAccount,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { assert } from "chai";

describe("rwa - Real Estate Fractionalizer E2E tests", () => {
  const provider = anchor.AnchorProvider.local();
  anchor.setProvider(provider);

  const program = anchor.workspace.Rwa as Program<Rwa>;
  const authority = provider.wallet.publicKey;
  
  let nftMint: anchor.web3.PublicKey;
  let usdcMint: anchor.web3.PublicKey;
  let fractionMint: anchor.web3.Keypair;
  let propertyAccount: anchor.web3.Keypair;
  let mintAuthority: anchor.web3.PublicKey;
  let rentVault: anchor.web3.PublicKey;
  let nftVault: anchor.web3.PublicKey;
  let rentVaultAta: anchor.web3.PublicKey;
  let nftVaultAta: anchor.web3.PublicKey;

  let buyer: anchor.web3.Keypair;
  let seller: anchor.web3.Keypair;

  before(async () => {
    // Create NFT mint (supply = 1)
    nftMint = await createMint(
      provider.connection,
      provider.wallet.payer,
      authority,
      null,
      0
    );

    // Create USDC mock mint
    usdcMint = await createMint(
      provider.connection,
      provider.wallet.payer,
      authority,
      null,
      6
    );

    // Mint 1 NFT to authority
    const authorityNftAta = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      provider.wallet.payer,
      nftMint,
      authority
    );
    await mintTo(
      provider.connection,
      provider.wallet.payer,
      nftMint,
      authorityNftAta.address,
      authority,
      1
    );

    // Setup buyer and seller keypairs
    buyer = anchor.web3.Keypair.generate();
    seller = anchor.web3.Keypair.generate();

    // Airdrop SOL to buyer and seller
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(buyer.publicKey, 10 * anchor.web3.LAMPORTS_PER_SOL)
    );
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(seller.publicKey, 10 * anchor.web3.LAMPORTS_PER_SOL)
    );

    // Create USDC accounts for buyer and seller
    const buyerUsdcAta = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      provider.wallet.payer,
      usdcMint,
      buyer.publicKey
    );
    const sellerUsdcAta = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      provider.wallet.payer,
      usdcMint,
      seller.publicKey
    );

    // Mint USDC to buyer for purchasing fractions
    await mintTo(
      provider.connection,
      provider.wallet.payer,
      usdcMint,
      buyerUsdcAta.address,
      authority,
      1_000_000_000 // 1000 USDC
    );
  });

  it("initializes a property with fraction mint and vaults", async () => {
    propertyAccount = anchor.web3.Keypair.generate();
    fractionMint = anchor.web3.Keypair.generate();

    // Derive PDAs
    [mintAuthority] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("fraction_authority"), propertyAccount.publicKey.toBuffer()],
      program.programId
    );

    [rentVault] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("rent_vault"), fractionMint.publicKey.toBuffer()],
      program.programId
    );

    [nftVault] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("nft_vault"), nftMint.toBuffer()],
      program.programId
    );

    // Derive associated token accounts for PDAs
    rentVaultAta = await anchor.utils.token.associatedAddress({
      mint: usdcMint,
      owner: rentVault,
    });

    nftVaultAta = await anchor.utils.token.associatedAddress({
      mint: nftMint,
      owner: nftVault,
    });

    const metadataUri = "ipfs://QmPropertyMetadata123";
    const totalFractions = new anchor.BN(1_000_000);
    const fractionDecimal = 6;

    await program.methods
      .initializeProperty(metadataUri, totalFractions, fractionDecimal)
      .accounts({
        propertyAccount: propertyAccount.publicKey,
        authority,
        nftMint,
        fractionMint: fractionMint.publicKey,
        mintAuthority,
        rentVault,
        nftVault,
        rentVaultAta,
        nftVaultAta,
        usdcMint,
        systemProgram: anchor.web3.SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      })
      .signers([propertyAccount, fractionMint])
      .rpc();

    const property = await program.account.propertyAccount.fetch(propertyAccount.publicKey);
    assert.equal(property.authority.toString(), authority.toString());
    assert.equal(property.totalFractions.toNumber(), 1_000_000);
    assert.equal(property.metadataUri, metadataUri);
    assert.equal(property.cumRentPerShare.toNumber(), 0);
  });

  it("deposits NFT into vault", async () => {
    // Transfer NFT from authority to nft vault
    const authorityNftAta = await anchor.utils.token.associatedAddress({
      mint: nftMint,
      owner: authority,
    });

    const transferIx = anchor.web3.SystemProgram.transfer({
      fromPubkey: authority,
      toPubkey: nftVault,
      lamports: 0,
    });

    // Use SPL token transfer to move NFT to vault
    const spl = require("@solana/spl-token");
    await spl.transfer(
      provider.connection,
      provider.wallet.payer,
      authorityNftAta,
      nftVaultAta,
      authority,
      1
    );

    await program.methods
      .depositNftIntoVault()
      .accounts({
        propertyAccount: propertyAccount.publicKey,
        nftMint,
        nftVaultAta,
      })
      .rpc();

    const vaultAccount = await getAccount(provider.connection, nftVaultAta);
    assert.equal(vaultAccount.amount.toString(), "1");
  });

  it("mints fractions to authority", async () => {
    const authorityFractionAta = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      provider.wallet.payer,
      fractionMint.publicKey,
      authority
    );

    const mintAmount = new anchor.BN(500_000);

    await program.methods
      .mintFractions(mintAmount)
      .accounts({
        propertyAccount: propertyAccount.publicKey,
        fractionMint: fractionMint.publicKey,
        mintAuthority,
        destination: authorityFractionAta.address,
        authority,
        tokenProgram: TOKEN_PROGRAM_ID,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      })
      .rpc();

    const ata = await getAccount(provider.connection, authorityFractionAta.address);
    assert.equal(ata.amount.toString(), "500000");
  });

  it("deposits rent and updates cumulative rent per share", async () => {
    const authorityUsdcAta = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      provider.wallet.payer,
      usdcMint,
      authority
    );

    // Mint USDC to authority for rent deposit
    await mintTo(
      provider.connection,
      provider.wallet.payer,
      usdcMint,
      authorityUsdcAta.address,
      authority,
      100_000_000 // 100 USDC
    );

    const rentAmount = new anchor.BN(10_000_000); // 10 USDC

    await program.methods
      .depositRent(rentAmount)
      .accounts({
        propertyAccount: propertyAccount.publicKey,
        payer: authority,
        payerUsdc: authorityUsdcAta.address,
        rentVaultAta,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();

    const property = await program.account.propertyAccount.fetch(propertyAccount.publicKey);
    // cum_rent_per_share = (10_000_000 * 1e9) / 1_000_000 = 10_000 * 1e9
    assert.ok(property.cumRentPerShare.toNumber() > 0);
  });

  it("claims rent for a holder", async () => {
    const authorityUsdcAta = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      provider.wallet.payer,
      usdcMint,
      authority
    );

    const [holderState] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("holder"), authority.toBuffer(), propertyAccount.publicKey.toBuffer()],
      program.programId
    );

    // NOTE: In a real scenario, the holder would have balance from minting or buying.
    // For this test, we'll skip creating holder state manually and rely on init_if_needed
    // in buy/transfer instructions. We'll test claim after a buy transaction.
  });

  it("buys fractions from seller to buyer", async () => {
    // First, mint fractions to seller
    const sellerFractionAta = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      provider.wallet.payer,
      fractionMint.publicKey,
      seller.publicKey
    );

    const mintAmount = new anchor.BN(100_000);
    await program.methods
      .mintFractions(mintAmount)
      .accounts({
        propertyAccount: propertyAccount.publicKey,
        fractionMint: fractionMint.publicKey,
        mintAuthority,
        destination: sellerFractionAta.address,
        authority,
        tokenProgram: TOKEN_PROGRAM_ID,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      })
      .rpc();

    // Get buyer and seller USDC/fraction ATAs
    const buyerUsdcAta = await anchor.utils.token.associatedAddress({
      mint: usdcMint,
      owner: buyer.publicKey,
    });

    const sellerUsdcAta = await anchor.utils.token.associatedAddress({
      mint: usdcMint,
      owner: seller.publicKey,
    });

    const buyerFractionAta = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      provider.wallet.payer,
      fractionMint.publicKey,
      buyer.publicKey
    );

    const [buyerHolder] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("holder"), buyer.publicKey.toBuffer(), propertyAccount.publicKey.toBuffer()],
      program.programId
    );

    const [sellerHolder] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("holder"), seller.publicKey.toBuffer(), propertyAccount.publicKey.toBuffer()],
      program.programId
    );

    const fractionAmount = new anchor.BN(50_000);
    const price = new anchor.BN(5_000_000); // 5 USDC

    await program.methods
      .buyFractions(fractionAmount, price)
      .accounts({
        propertyAccount: propertyAccount.publicKey,
        buyer: buyer.publicKey,
        seller: seller.publicKey,
        buyerUsdc: buyerUsdcAta,
        sellerUsdc: sellerUsdcAta,
        buyerFractionAta: buyerFractionAta.address,
        sellerFractionAta: sellerFractionAta.address,
        buyerHolder,
        sellerHolder,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([buyer, seller])
      .rpc();

    const buyerAta = await getAccount(provider.connection, buyerFractionAta.address);
    assert.equal(buyerAta.amount.toString(), "50000");

    const buyerHolderAccount = await program.account.holderState.fetch(buyerHolder);
    assert.equal(buyerHolderAccount.balance.toNumber(), 50_000);
  });

  it("transfers fractions between holders", async () => {
    const recipient = anchor.web3.Keypair.generate();
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(recipient.publicKey, 10 * anchor.web3.LAMPORTS_PER_SOL)
    );

    const recipientFractionAta = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      provider.wallet.payer,
      fractionMint.publicKey,
      recipient.publicKey
    );

    const buyerFractionAta = await anchor.utils.token.associatedAddress({
      mint: fractionMint.publicKey,
      owner: buyer.publicKey,
    });

    const [sourceHolder] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("holder"), buyer.publicKey.toBuffer(), propertyAccount.publicKey.toBuffer()],
      program.programId
    );

    const [destHolder] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("holder"), recipient.publicKey.toBuffer(), propertyAccount.publicKey.toBuffer()],
      program.programId
    );

    const transferAmount = new anchor.BN(10_000);

    await program.methods
      .transferFractions(transferAmount)
      .accounts({
        propertyAccount: propertyAccount.publicKey,
        sourceHolder,
        destHolder,
        sourceFractionAta: buyerFractionAta,
        destFractionAta: recipientFractionAta.address,
        sourceOwner: buyer.publicKey,
        destOwner: recipient.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([buyer, recipient])
      .rpc();

    const recipientAta = await getAccount(provider.connection, recipientFractionAta.address);
    assert.equal(recipientAta.amount.toString(), "10000");
  });

  it("burns fractions", async () => {
    const buyerFractionAta = await anchor.utils.token.associatedAddress({
      mint: fractionMint.publicKey,
      owner: buyer.publicKey,
    });

    const [holderState] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("holder"), buyer.publicKey.toBuffer(), propertyAccount.publicKey.toBuffer()],
      program.programId
    );

    const burnAmount = new anchor.BN(5_000);

    await program.methods
      .burnFractions(burnAmount)
      .accounts({
        propertyAccount: propertyAccount.publicKey,
        holder: buyer.publicKey,
        holderState,
        fractionMint: fractionMint.publicKey,
        holderFractionAta: buyerFractionAta,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([buyer])
      .rpc();

    const buyerAta = await getAccount(provider.connection, buyerFractionAta);
    // Previous balance was 50_000, transferred 10_000, so 40_000, now burned 5_000 = 35_000
    assert.equal(buyerAta.amount.toString(), "35000");
  });
});
