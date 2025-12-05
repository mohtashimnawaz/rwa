import * as anchor from "@coral-xyz/anchor";
import { Program, web3 } from "@coral-xyz/anchor";
import { Rwa } from "../target/types/rwa";
import {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  getAccount,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { assert } from "chai";

describe("rwa", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Rwa as Program<Rwa>;
  const authority = provider.wallet.publicKey;

  let propertyAccount: web3.Keypair;
  let fractionMint: web3.Keypair;
  let nftMint: web3.PublicKey;
  let usdcMint: web3.PublicKey;
  let mintAuthority: web3.PublicKey;
  let rentVault: web3.PublicKey;
  let nftVault: web3.PublicKey;
  let rentVaultAta: web3.PublicKey;
  let nftVaultAta: web3.PublicKey;

  before(async () => {
    console.log("Setting up test environment...");

    nftMint = await createMint(
      provider.connection,
      provider.wallet.payer,
      authority,
      null,
      0
    );

    usdcMint = await createMint(
      provider.connection,
      provider.wallet.payer,
      authority,
      null,
      6
    );

    console.log("NFT Mint:", nftMint.toString());
    console.log("USDC Mint:", usdcMint.toString());
  });

  it("initializes property", async () => {
    propertyAccount = web3.Keypair.generate();
    fractionMint = web3.Keypair.generate();

    [mintAuthority] = web3.PublicKey.findProgramAddressSync(
      [Buffer.from("fraction_authority"), propertyAccount.publicKey.toBuffer()],
      program.programId
    );

    [rentVault] = web3.PublicKey.findProgramAddressSync(
      [Buffer.from("rent_vault"), fractionMint.publicKey.toBuffer()],
      program.programId
    );

    [nftVault] = web3.PublicKey.findProgramAddressSync(
      [Buffer.from("nft_vault"), nftMint.toBuffer()],
      program.programId
    );

    const rentVaultAccount = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      provider.wallet.payer,
      usdcMint,
      rentVault,
      true
    );
    rentVaultAta = rentVaultAccount.address;

    const nftVaultAccount = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      provider.wallet.payer,
      nftMint,
      nftVault,
      true
    );
    nftVaultAta = nftVaultAccount.address;

    const metadataUri = "https://ipfs.io/ipfs/QmExample123";
    const uriBytes = Buffer.from(metadataUri);
    const paddedUri = Buffer.concat([uriBytes, Buffer.alloc(200 - uriBytes.length)]);

    const totalFractions = new anchor.BN(1_000_000);
    const fractionDecimal = 6;

    console.log("Initializing property...");
    console.log("Property Account:", propertyAccount.publicKey.toString());
    console.log("Fraction Mint:", fractionMint.publicKey.toString());
    
    const tx = await program.methods
      .initializeProperty(Array.from(paddedUri), totalFractions, fractionDecimal)
      .accountsPartial({
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
      })
      .signers([propertyAccount, fractionMint])
      .rpc();

    console.log("Initialize tx:", tx);

    const property = await program.account.propertyAccount.fetch(propertyAccount.publicKey);
    assert.equal(property.authority.toString(), authority.toString());
    assert.equal(property.totalFractions.toString(), "1000000");

    console.log("✅ Property initialized");
  });

  it("mints fractions", async () => {
    const destination = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      provider.wallet.payer,
      fractionMint.publicKey,
      authority
    );

    const amount = new anchor.BN(100_000);

    await program.methods
      .mintFractions(amount)
      .accountsPartial({
        propertyAccount: propertyAccount.publicKey,
        fractionMint: fractionMint.publicKey,
        mintAuthority,
        destination: destination.address,
      })
      .rpc();

    const tokenAccount = await getAccount(provider.connection, destination.address);
    assert.equal(tokenAccount.amount.toString(), "100000");

    console.log("✅ Fractions minted");
  });

  it("initializes holder state (first claim before rent deposit)", async () => {
    const [holderState] = web3.PublicKey.findProgramAddressSync(
      [Buffer.from("holder"), authority.toBuffer(), propertyAccount.publicKey.toBuffer()],
      program.programId
    );

    const holderFractionAta = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      provider.wallet.payer,
      fractionMint.publicKey,
      authority
    );

    const holderUsdcAta = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      provider.wallet.payer,
      usdcMint,
      authority
    );

    // First claim initializes holder_state with current cum_rent_per_share (which is 0)
    await program.methods
      .claimRent()
      .accountsPartial({
        propertyAccount: propertyAccount.publicKey,
        holderState,
        payer: authority,
        holderFractionAta: holderFractionAta.address,
        receiverUsdc: holderUsdcAta.address,
        rentVault,
        rentVaultAta,
      })
      .rpc();

    const holderStateAccount = await program.account.holderState.fetch(holderState);
    assert.equal(holderStateAccount.balance.toString(), "100000");
    assert.equal(holderStateAccount.rewardDebt.toString(), "0"); // cum_rent_per_share was 0

    console.log("✅ Holder state initialized");
  });

  it("deposits rent", async () => {
    const payerUsdc = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      provider.wallet.payer,
      usdcMint,
      authority
    );

    await mintTo(
      provider.connection,
      provider.wallet.payer,
      usdcMint,
      payerUsdc.address,
      authority,
      10_000_000
    );

    const depositAmount = new anchor.BN(5_000_000);

    console.log("Depositing rent...");
    console.log("Deposit amount:", depositAmount.toString());
    
    const propertyBefore = await program.account.propertyAccount.fetch(propertyAccount.publicKey);
    console.log("cum_rent_per_share BEFORE deposit:", propertyBefore.cumRentPerShare.toString());

    await program.methods
      .depositRent(depositAmount)
      .accountsPartial({
        propertyAccount: propertyAccount.publicKey,
        payer: authority,
        payerUsdc: payerUsdc.address,
        rentVaultAta,
      })
      .rpc();

    const rentVaultAccount = await getAccount(provider.connection, rentVaultAta);
    assert.equal(rentVaultAccount.amount.toString(), "5000000");

    const property = await program.account.propertyAccount.fetch(propertyAccount.publicKey);
    console.log("cum_rent_per_share AFTER deposit:", property.cumRentPerShare.toString());
    const expectedIncrement = 5_000_000 * 1_000_000_000 / 1_000_000;
    console.log("Expected increment:", expectedIncrement);
    console.log("Expected total cum_rent_per_share:", expectedIncrement);
    assert.ok(property.cumRentPerShare.gt(new anchor.BN(0)));

    console.log("✅ Rent deposited");
  });

  it("claims rent", async () => {
    const [holderState] = web3.PublicKey.findProgramAddressSync(
      [Buffer.from("holder"), authority.toBuffer(), propertyAccount.publicKey.toBuffer()],
      program.programId
    );

    const holderFractionAta = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      provider.wallet.payer,
      fractionMint.publicKey,
      authority
    );
    console.log("Holder fraction ATA balance:", (await getAccount(provider.connection, holderFractionAta.address)).amount.toString());

    const holderUsdcAta = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      provider.wallet.payer,
      usdcMint,
      authority
    );

    const balanceBefore = (await getAccount(provider.connection, holderUsdcAta.address)).amount;
    console.log("Balance before claim:", balanceBefore.toString());

    // Check property cum_rent_per_share before claim
    const propertyBefore = await program.account.propertyAccount.fetch(propertyAccount.publicKey);
    console.log("Property cum_rent_per_share (BN):", propertyBefore.cumRentPerShare.toString());
    console.log("Property cum_rent_per_share (number):", propertyBefore.cumRentPerShare.toNumber());
    console.log("Property total_fractions:", propertyBefore.totalFractions.toString());

    // Manual calculation
    const expectedCumRentPerShare = 5_000_000 * 1_000_000_000 / 1_000_000;
    console.log("Expected cum_rent_per_share:", expectedCumRentPerShare);

    await program.methods
      .claimRent()
      .accountsPartial({
        propertyAccount: propertyAccount.publicKey,
        holderState,
        payer: authority,
        holderFractionAta: holderFractionAta.address,
        receiverUsdc: holderUsdcAta.address,
        rentVault,
        rentVaultAta,
      })
      .rpc();

    const balanceAfter = (await getAccount(provider.connection, holderUsdcAta.address)).amount;
    console.log("Balance after claim:", balanceAfter.toString());
    const claimed = balanceAfter - balanceBefore;
    console.log("Claimed:", claimed.toString());

    // Check holder state was initialized
    const holderStateAccount = await program.account.holderState.fetch(holderState);
    console.log("Holder state balance:", holderStateAccount.balance.toString());
    console.log("Holder state reward_debt:", holderStateAccount.rewardDebt.toString());

    assert.ok(claimed > BigInt(0), `Should have claimed rent, but claimed ${claimed}`);
    console.log("✅ Rent claimed:", claimed.toString());
  });
});
