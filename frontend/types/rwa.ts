/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/rwa.json`.
 */
export type Rwa = {
  "address": "DYMKJAp7o44QC7ZwB6JFbJY4mkDDtoAMbrwsTCrZqcj3",
  "metadata": {
    "name": "rwa",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "burnFractions",
      "docs": [
        "Burn fractions: holder burns their fraction tokens, reducing total supply.",
        "This is typically used when closing or liquidating a property."
      ],
      "discriminator": [
        112,
        169,
        53,
        68,
        208,
        84,
        225,
        12
      ],
      "accounts": [
        {
          "name": "propertyAccount",
          "writable": true
        },
        {
          "name": "holder",
          "writable": true,
          "signer": true
        },
        {
          "name": "holderState",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  104,
                  111,
                  108,
                  100,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "holder"
              },
              {
                "kind": "account",
                "path": "propertyAccount"
              }
            ]
          }
        },
        {
          "name": "fractionMint",
          "writable": true
        },
        {
          "name": "holderFractionAta",
          "writable": true
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "buyFractions",
      "docs": [
        "Buy fractions: buyer pays USDC to seller, program transfers fraction tokens",
        "from seller to buyer. Both buyer and seller holder accounting is updated."
      ],
      "discriminator": [
        251,
        104,
        152,
        46,
        70,
        130,
        211,
        220
      ],
      "accounts": [
        {
          "name": "propertyAccount",
          "writable": true
        },
        {
          "name": "buyer",
          "writable": true,
          "signer": true
        },
        {
          "name": "seller",
          "writable": true,
          "signer": true
        },
        {
          "name": "buyerUsdc",
          "writable": true
        },
        {
          "name": "sellerUsdc",
          "writable": true
        },
        {
          "name": "buyerFractionAta",
          "writable": true
        },
        {
          "name": "sellerFractionAta",
          "writable": true
        },
        {
          "name": "buyerHolder",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  104,
                  111,
                  108,
                  100,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "buyer"
              },
              {
                "kind": "account",
                "path": "propertyAccount"
              }
            ]
          }
        },
        {
          "name": "sellerHolder",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  104,
                  111,
                  108,
                  100,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "seller"
              },
              {
                "kind": "account",
                "path": "propertyAccount"
              }
            ]
          }
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "fractionAmount",
          "type": "u64"
        },
        {
          "name": "price",
          "type": "u64"
        }
      ]
    },
    {
      "name": "claimRent",
      "docs": [
        "Claim rent for a holder: pay out unclaimed + newly accrued amount."
      ],
      "discriminator": [
        57,
        233,
        51,
        137,
        102,
        101,
        26,
        101
      ],
      "accounts": [
        {
          "name": "propertyAccount",
          "writable": true
        },
        {
          "name": "holderState",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  104,
                  111,
                  108,
                  100,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "payer"
              },
              {
                "kind": "account",
                "path": "propertyAccount"
              }
            ]
          }
        },
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "holderFractionAta",
          "docs": [
            "Holder's fraction token account - needed to get balance on first claim"
          ]
        },
        {
          "name": "rentVaultAta",
          "writable": true
        },
        {
          "name": "rentVault"
        },
        {
          "name": "receiverUsdc",
          "writable": true
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "depositNftIntoVault",
      "docs": [
        "Deposit the NFT into the escrow vault PDA. The client should transfer",
        "the NFT (SPL token with supply=1) into `nft_vault_ata` which is",
        "owned by the `nft_vault` PDA. This instruction verifies ownership."
      ],
      "discriminator": [
        128,
        117,
        105,
        170,
        250,
        64,
        96,
        236
      ],
      "accounts": [
        {
          "name": "propertyAccount",
          "writable": true
        },
        {
          "name": "nftMint",
          "relations": [
            "propertyAccount"
          ]
        },
        {
          "name": "nftVaultAta",
          "docs": [
            "Token account holding the NFT (owned by nft_vault PDA)"
          ],
          "writable": true
        }
      ],
      "args": []
    },
    {
      "name": "depositRent",
      "docs": [
        "Deposit rent (USDC) into RentVault PDA and update cumulative rent per share."
      ],
      "discriminator": [
        54,
        14,
        183,
        244,
        81,
        178,
        23,
        27
      ],
      "accounts": [
        {
          "name": "propertyAccount",
          "writable": true
        },
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "payerUsdc",
          "writable": true
        },
        {
          "name": "rentVaultAta",
          "writable": true
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "initializeProperty",
      "docs": [
        "Initialize a property account and related PDAs: creates the fraction mint",
        "and associated rent/nft vault token accounts (ATAs) owned by PDAs."
      ],
      "discriminator": [
        94,
        188,
        21,
        36,
        186,
        50,
        195,
        141
      ],
      "accounts": [
        {
          "name": "propertyAccount",
          "writable": true,
          "signer": true
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "nftMint"
        },
        {
          "name": "fractionMint",
          "writable": true,
          "signer": true
        },
        {
          "name": "mintAuthority",
          "docs": [
            "seeds: [\"fraction_authority\", property_account]"
          ]
        },
        {
          "name": "rentVault"
        },
        {
          "name": "nftVault"
        },
        {
          "name": "rentVaultAta",
          "docs": [
            "Associated token accounts (should be created client-side)"
          ]
        },
        {
          "name": "nftVaultAta"
        },
        {
          "name": "usdcMint",
          "docs": [
            "The USDC mint used for rent collection"
          ]
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "metadataUri",
          "type": {
            "array": [
              "u8",
              200
            ]
          }
        },
        {
          "name": "totalFractions",
          "type": "u64"
        },
        {
          "name": "fractionDecimal",
          "type": "u8"
        }
      ]
    },
    {
      "name": "mintFractions",
      "docs": [
        "Mint fractions into owner's fraction token account. Only property authority may call."
      ],
      "discriminator": [
        131,
        213,
        185,
        64,
        148,
        91,
        219,
        69
      ],
      "accounts": [
        {
          "name": "propertyAccount",
          "writable": true
        },
        {
          "name": "fractionMint",
          "writable": true
        },
        {
          "name": "mintAuthority"
        },
        {
          "name": "destination",
          "writable": true
        },
        {
          "name": "authority",
          "signer": true,
          "relations": [
            "propertyAccount"
          ]
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "transferFractions",
      "docs": [
        "Transfer fractions between two holders. All transfers must go through",
        "the program to correctly update reward accounting."
      ],
      "discriminator": [
        104,
        234,
        21,
        34,
        172,
        192,
        226,
        103
      ],
      "accounts": [
        {
          "name": "propertyAccount",
          "writable": true
        },
        {
          "name": "sourceHolder",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  104,
                  111,
                  108,
                  100,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "sourceOwner"
              },
              {
                "kind": "account",
                "path": "propertyAccount"
              }
            ]
          }
        },
        {
          "name": "destHolder",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  104,
                  111,
                  108,
                  100,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "destOwner"
              },
              {
                "kind": "account",
                "path": "propertyAccount"
              }
            ]
          }
        },
        {
          "name": "sourceFractionAta",
          "writable": true
        },
        {
          "name": "destFractionAta",
          "writable": true
        },
        {
          "name": "sourceOwner",
          "signer": true
        },
        {
          "name": "destOwner",
          "writable": true,
          "signer": true
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "unlockNft",
      "docs": [
        "Unlock NFT from escrow vault: only allowed when all fractions are burned.",
        "Transfers the NFT back to the property authority."
      ],
      "discriminator": [
        162,
        144,
        82,
        231,
        137,
        85,
        213,
        0
      ],
      "accounts": [
        {
          "name": "propertyAccount",
          "writable": true
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "nftMint"
        },
        {
          "name": "fractionMint",
          "writable": true
        },
        {
          "name": "nftVault"
        },
        {
          "name": "nftVaultAta",
          "writable": true
        },
        {
          "name": "authorityNftAta",
          "writable": true
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "holderState",
      "discriminator": [
        222,
        82,
        176,
        75,
        3,
        75,
        155,
        184
      ]
    },
    {
      "name": "propertyAccount",
      "discriminator": [
        193,
        89,
        151,
        121,
        84,
        43,
        4,
        71
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "numericOverflow",
      "msg": "Numeric overflow occurred"
    },
    {
      "code": 6001,
      "name": "unauthorized",
      "msg": "unauthorized"
    },
    {
      "code": 6002,
      "name": "invalidNftVaultAmount",
      "msg": "Invalid NFT vault amount"
    },
    {
      "code": 6003,
      "name": "noFractions",
      "msg": "No fractions minted"
    },
    {
      "code": 6004,
      "name": "noPendingRewards",
      "msg": "No pending rewards"
    },
    {
      "code": 6005,
      "name": "insufficientFunds",
      "msg": "Insufficient fraction balance"
    },
    {
      "code": 6006,
      "name": "fractionsNotBurned",
      "msg": "Fractions must be fully burned before unlocking NFT"
    },
    {
      "code": 6007,
      "name": "metadataUriTooLong",
      "msg": "Metadata URI exceeds 200 bytes"
    }
  ],
  "types": [
    {
      "name": "holderState",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "holder",
            "type": "pubkey"
          },
          {
            "name": "property",
            "type": "pubkey"
          },
          {
            "name": "balance",
            "type": "u64"
          },
          {
            "name": "rewardDebt",
            "type": "u128"
          },
          {
            "name": "unclaimed",
            "type": "u128"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "propertyAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "propertyKey",
            "type": "pubkey"
          },
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "nftMint",
            "type": "pubkey"
          },
          {
            "name": "fractionMint",
            "type": "pubkey"
          },
          {
            "name": "totalFractions",
            "type": "u64"
          },
          {
            "name": "mintedFractions",
            "type": "u64"
          },
          {
            "name": "fractionDecimal",
            "type": "u8"
          },
          {
            "name": "cumRentPerShare",
            "type": "u128"
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "metadataUri",
            "type": {
              "array": [
                "u8",
                200
              ]
            }
          }
        ]
      }
    }
  ]
};
