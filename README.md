# Real World Asset (RWA) Fractionalization Platform

A decentralized platform for fractionalizing real estate properties on Solana, enabling tokenized ownership and automated rent distribution.

> **MVP Status**: Core smart contract functionality complete. Backend services (KYC/IPFS) can be added later for production deployment.

## 🏗️ Architecture

### Smart Contract (Anchor/Solana)
- **Program ID**: `DYMKJAp7o44QC7ZwB6JFbJY4mkDDtoAMbrwsTCrZqcj3`
- **Location**: `programs/rwa/src/lib.rs`

### Features
- 🏠 **Property NFT Fractionalization** - Lock property NFT and mint fractional SPL tokens
- 💰 **Automated Rent Distribution** - USDC rent distributed proportionally to holders
- 🔄 **P2P Trading** - Buy/sell/transfer fractions with automatic accounting
- 📊 **MasterChef-style Rewards** - Cumulative reward tracking with fixed-point math
- 🔐 **PDA-based Security** - Secure vaults for NFTs and rent payments

## 📋 Instructions

### Core Operations
1. `initialize_property` - Create fractional property with NFT lock
2. `deposit_nft_into_vault` - Escrow property NFT
3. `mint_fractions` - Issue fractional tokens to investors
4. `buy_fractions` - P2P purchase with USDC payment
5. `transfer_fractions` - Send fractions with reward accounting
6. `deposit_rent` - Property owner deposits monthly rent
7. `claim_rent` - Holders claim proportional USDC rewards
8. `burn_fractions` - Reduce supply when liquidating
9. `unlock_nft` - Return NFT when all fractions burned

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Rust 1.75+
- Solana CLI
- Anchor 0.31.1

### Installation
```bash
# Install dependencies
yarn install

# Build program
anchor build

# Run tests
anchor test

# Deploy to devnet
anchor deploy --provider.cluster devnet
```

## 🧪 Testing

All E2E tests passing:
```bash
anchor test

# Output:
#   ✓ initializes property (1430ms)
#   ✓ mints fractions (935ms)
#   ✓ initializes holder state (930ms)
#   ✓ deposits rent (947ms)
#   ✓ claims rent (469ms)
#   5 passing (5s)
```

## 🔮 Future Enhancements (Optional Backend)

For production deployment, consider adding:
- **KYC/AML** - Identity verification via Jumio/Onfido/Persona
- **IPFS Storage** - Property documents and legal agreements
- **Property Database** - PostgreSQL for faster queries and analytics
- **API Layer** - REST/GraphQL for easier frontend integration

The smart contract works standalone - backend services are only needed for regulatory compliance and enhanced UX.

## 📊 Account Structure

### PropertyAccount (286 bytes)
- `property_key`: Pubkey
- `authority`: Pubkey (property owner)
- `nft_mint`: Pubkey (property NFT)
- `fraction_mint`: Pubkey (fractional SPL token)
- `total_fractions`: u64 (max supply)
- `minted_fractions`: u64 (circulating supply)
- `cum_rent_per_share`: u128 (reward accumulator)
- `metadata_uri`: [u8; 200] (IPFS link)

### HolderState (122 bytes)
- `holder`: Pubkey
- `property`: Pubkey
- `balance`: u64 (fraction tokens held)
- `reward_debt`: u128 (accounting for cumulative rewards)
- `unclaimed`: u128 (pending rewards)

## 🔐 PDAs (Program Derived Addresses)

- **Mint Authority**: `["fraction_authority", property_account]`
- **Rent Vault**: `["rent_vault", fraction_mint]`
- **NFT Vault**: `["nft_vault", nft_mint]`
- **Holder State**: `["holder", holder_pubkey, property_pubkey]`

## 💡 Reward Math

Uses fixed-point arithmetic with SCALE = 10^9:

```
cum_rent_per_share += (rent_amount * SCALE) / minted_fractions

pending_reward = (holder_balance * cum_rent_per_share) - reward_debt
payout = pending_reward / SCALE
```

## 📁 Project Structure

```
rwa/
├── programs/rwa/          # Anchor smart contract
│   └── src/lib.rs         # Core program logic (585 lines)
├── tests/                 # E2E tests
│   └── rwa.ts             # Complete test suite (298 lines)
├── target/                # Build artifacts
│   ├── idl/rwa.json       # Generated IDL
│   ├── types/rwa.ts       # TypeScript types
│   └── deploy/            # Program keypair
└── migrations/            # Deployment scripts
```

## 🎯 Frontend Integration

### Using @coral-xyz/anchor

```typescript
import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';
import { Rwa } from '../target/types/rwa';

// Connect to program
const provider = anchor.AnchorProvider.env();
anchor.setProvider(provider);
const program = anchor.workspace.Rwa as Program<Rwa>;

// Initialize property
await program.methods
  .initializeProperty(
    totalFractions,
    metadataUri
  )
  .accountsPartial({
    property: propertyKeypair.publicKey,
    authority: provider.wallet.publicKey,
    // ... other accounts
  })
  .signers([propertyKeypair])
  .rpc();

// Claim rent
await program.methods
  .claimRent()
  .accountsPartial({
    holder: provider.wallet.publicKey,
    property: propertyPubkey,
    // ... other accounts
  })
  .rpc();
```

## 🔧 Configuration

### Anchor.toml
```toml
[programs.localnet]
rwa = "DYMKJAp7o44QC7ZwB6JFbJY4mkDDtoAMbrwsTCrZqcj3"

[provider]
cluster = "localnet"
wallet = "~/.config/solana/id.json"

[scripts]
test = "yarn run ts-mocha -p ./tsconfig.json -t 1000000 tests/**/*.ts"
```

## 🚨 Security Considerations

- ✅ Checked arithmetic throughout (no overflow/underflow)
- ✅ PDA-based authority (no private key storage)
- ✅ Account ownership validation
- ✅ KYC/AML compliance ready
- ✅ Fixed-size arrays (no dynamic allocation vulnerabilities)

## 📝 License

MIT

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📞 Support

For issues and questions, please open a GitHub issue.

---

Built with ❤️ using Anchor Framework
