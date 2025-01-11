/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/reward_system.json`.
 */
export type RewardSystem = {
    "address": "6krd1VXdtv13VzsgmbwN3pgpqgkWKApYzwEawRGsEuUk",
    "metadata": {
      "name": "rewardSystem",
      "version": "0.1.0",
      "spec": "0.1.0",
      "description": "Created with Anchor"
    },
    "instructions": [
      {
        "name": "claimRewards",
        "discriminator": [
          4,
          144,
          132,
          71,
          116,
          23,
          151,
          80
        ],
        "accounts": [
          {
            "name": "userAdmin",
            "writable": true,
            "signer": true
          },
          {
            "name": "user",
            "writable": true,
            "signer": true
          },
          {
            "name": "nftMintAddress"
          },
          {
            "name": "rewardEntry",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    114,
                    101,
                    119,
                    97,
                    114,
                    100,
                    95,
                    101,
                    110,
                    116,
                    114,
                    121
                  ]
                },
                {
                  "kind": "account",
                  "path": "user"
                },
                {
                  "kind": "account",
                  "path": "nftMintAddress"
                }
              ]
            }
          },
          {
            "name": "tokenMint"
          },
          {
            "name": "tokenStorageAuthority",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    116,
                    111,
                    107,
                    101,
                    110,
                    95,
                    115,
                    116,
                    111,
                    114,
                    97,
                    103,
                    101
                  ]
                }
              ]
            }
          },
          {
            "name": "tokenStorageAccount",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "account",
                  "path": "tokenStorageAuthority"
                },
                {
                  "kind": "const",
                  "value": [
                    6,
                    221,
                    246,
                    225,
                    215,
                    101,
                    161,
                    147,
                    217,
                    203,
                    225,
                    70,
                    206,
                    235,
                    121,
                    172,
                    28,
                    180,
                    133,
                    237,
                    95,
                    91,
                    55,
                    145,
                    58,
                    140,
                    245,
                    133,
                    126,
                    255,
                    0,
                    169
                  ]
                },
                {
                  "kind": "account",
                  "path": "tokenMint"
                }
              ],
              "program": {
                "kind": "const",
                "value": [
                  140,
                  151,
                  37,
                  143,
                  78,
                  36,
                  137,
                  241,
                  187,
                  61,
                  16,
                  41,
                  20,
                  142,
                  13,
                  131,
                  11,
                  90,
                  19,
                  153,
                  218,
                  255,
                  16,
                  132,
                  4,
                  142,
                  123,
                  216,
                  219,
                  233,
                  248,
                  89
                ]
              }
            }
          },
          {
            "name": "userTokenAccount",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "account",
                  "path": "user"
                },
                {
                  "kind": "const",
                  "value": [
                    6,
                    221,
                    246,
                    225,
                    215,
                    101,
                    161,
                    147,
                    217,
                    203,
                    225,
                    70,
                    206,
                    235,
                    121,
                    172,
                    28,
                    180,
                    133,
                    237,
                    95,
                    91,
                    55,
                    145,
                    58,
                    140,
                    245,
                    133,
                    126,
                    255,
                    0,
                    169
                  ]
                },
                {
                  "kind": "account",
                  "path": "tokenMint"
                }
              ],
              "program": {
                "kind": "const",
                "value": [
                  140,
                  151,
                  37,
                  143,
                  78,
                  36,
                  137,
                  241,
                  187,
                  61,
                  16,
                  41,
                  20,
                  142,
                  13,
                  131,
                  11,
                  90,
                  19,
                  153,
                  218,
                  255,
                  16,
                  132,
                  4,
                  142,
                  123,
                  216,
                  219,
                  233,
                  248,
                  89
                ]
              }
            }
          },
          {
            "name": "adminAccount",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    97,
                    100,
                    109,
                    105,
                    110,
                    95,
                    97,
                    99,
                    99,
                    111,
                    117,
                    110,
                    116
                  ]
                }
              ]
            }
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
            "name": "systemProgram",
            "address": "11111111111111111111111111111111"
          }
        ],
        "args": [
          {
            "name": "rewardAmount",
            "type": "u64"
          },
          {
            "name": "nonce",
            "type": "u64"
          }
        ]
      },
      {
        "name": "fundTokenStorage",
        "discriminator": [
          56,
          188,
          131,
          56,
          117,
          30,
          26,
          4
        ],
        "accounts": [
          {
            "name": "user",
            "writable": true,
            "signer": true
          },
          {
            "name": "tokenMint"
          },
          {
            "name": "tokenStorageAuthority",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    116,
                    111,
                    107,
                    101,
                    110,
                    95,
                    115,
                    116,
                    111,
                    114,
                    97,
                    103,
                    101
                  ]
                }
              ]
            }
          },
          {
            "name": "tokenStorageAccount",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "account",
                  "path": "tokenStorageAuthority"
                },
                {
                  "kind": "const",
                  "value": [
                    6,
                    221,
                    246,
                    225,
                    215,
                    101,
                    161,
                    147,
                    217,
                    203,
                    225,
                    70,
                    206,
                    235,
                    121,
                    172,
                    28,
                    180,
                    133,
                    237,
                    95,
                    91,
                    55,
                    145,
                    58,
                    140,
                    245,
                    133,
                    126,
                    255,
                    0,
                    169
                  ]
                },
                {
                  "kind": "account",
                  "path": "tokenMint"
                }
              ],
              "program": {
                "kind": "const",
                "value": [
                  140,
                  151,
                  37,
                  143,
                  78,
                  36,
                  137,
                  241,
                  187,
                  61,
                  16,
                  41,
                  20,
                  142,
                  13,
                  131,
                  11,
                  90,
                  19,
                  153,
                  218,
                  255,
                  16,
                  132,
                  4,
                  142,
                  123,
                  216,
                  219,
                  233,
                  248,
                  89
                ]
              }
            }
          },
          {
            "name": "userTokenAccount",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "account",
                  "path": "user"
                },
                {
                  "kind": "const",
                  "value": [
                    6,
                    221,
                    246,
                    225,
                    215,
                    101,
                    161,
                    147,
                    217,
                    203,
                    225,
                    70,
                    206,
                    235,
                    121,
                    172,
                    28,
                    180,
                    133,
                    237,
                    95,
                    91,
                    55,
                    145,
                    58,
                    140,
                    245,
                    133,
                    126,
                    255,
                    0,
                    169
                  ]
                },
                {
                  "kind": "account",
                  "path": "tokenMint"
                }
              ],
              "program": {
                "kind": "const",
                "value": [
                  140,
                  151,
                  37,
                  143,
                  78,
                  36,
                  137,
                  241,
                  187,
                  61,
                  16,
                  41,
                  20,
                  142,
                  13,
                  131,
                  11,
                  90,
                  19,
                  153,
                  218,
                  255,
                  16,
                  132,
                  4,
                  142,
                  123,
                  216,
                  219,
                  233,
                  248,
                  89
                ]
              }
            }
          },
          {
            "name": "associatedTokenProgram",
            "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
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
        "name": "initializeSystem",
        "discriminator": [
          50,
          173,
          248,
          140,
          202,
          35,
          141,
          150
        ],
        "accounts": [
          {
            "name": "user",
            "writable": true,
            "signer": true
          },
          {
            "name": "adminAccount",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    97,
                    100,
                    109,
                    105,
                    110,
                    95,
                    97,
                    99,
                    99,
                    111,
                    117,
                    110,
                    116
                  ]
                }
              ]
            }
          },
          {
            "name": "systemProgram",
            "address": "11111111111111111111111111111111"
          }
        ],
        "args": []
      },
      {
        "name": "pauseProgram",
        "discriminator": [
          91,
          86,
          253,
          175,
          66,
          236,
          172,
          124
        ],
        "accounts": [
          {
            "name": "user",
            "writable": true,
            "signer": true
          },
          {
            "name": "adminAccount",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    97,
                    100,
                    109,
                    105,
                    110,
                    95,
                    97,
                    99,
                    99,
                    111,
                    117,
                    110,
                    116
                  ]
                }
              ]
            }
          }
        ],
        "args": []
      },
      {
        "name": "unpauseProgram",
        "discriminator": [
          43,
          162,
          233,
          92,
          254,
          62,
          69,
          58
        ],
        "accounts": [
          {
            "name": "user",
            "writable": true,
            "signer": true
          },
          {
            "name": "adminAccount",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    97,
                    100,
                    109,
                    105,
                    110,
                    95,
                    97,
                    99,
                    99,
                    111,
                    117,
                    110,
                    116
                  ]
                }
              ]
            }
          }
        ],
        "args": []
      },
      {
        "name": "updateAdmin",
        "discriminator": [
          161,
          176,
          40,
          213,
          60,
          184,
          179,
          228
        ],
        "accounts": [
          {
            "name": "user",
            "writable": true,
            "signer": true
          },
          {
            "name": "adminAccount",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    97,
                    100,
                    109,
                    105,
                    110,
                    95,
                    97,
                    99,
                    99,
                    111,
                    117,
                    110,
                    116
                  ]
                }
              ]
            }
          }
        ],
        "args": [
          {
            "name": "newAdminPubkey",
            "type": "pubkey"
          }
        ]
      }
    ],
    "accounts": [
      {
        "name": "adminAccount",
        "discriminator": [
          153,
          119,
          180,
          178,
          43,
          66,
          235,
          148
        ]
      },
      {
        "name": "rewardEntry",
        "discriminator": [
          208,
          191,
          173,
          14,
          213,
          84,
          179,
          162
        ]
      }
    ],
    "errors": [
      {
        "code": 6000,
        "name": "unauthorizedAdmin",
        "msg": "Unauthorized access admin *."
      },
      {
        "code": 6001,
        "name": "unauthorizedUser",
        "msg": "Unauthorized access user *."
      },
      {
        "code": 6002,
        "name": "missingAdminSignature",
        "msg": "Missing admin signature *."
      },
      {
        "code": 6003,
        "name": "nonceAlreadyClaimed",
        "msg": "Nonce already claimed or invalid *."
      },
      {
        "code": 6004,
        "name": "programPaused",
        "msg": "Program is paused *."
      },
      {
        "code": 6005,
        "name": "claimAlreadyMadeToday",
        "msg": "Claim already made today *."
      },
      {
        "code": 6006,
        "name": "arithmeticOverflow",
        "msg": "Aricmetic overflow *."
      }
    ],
    "types": [
      {
        "name": "adminAccount",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "adminPubkey",
              "type": "pubkey"
            },
            {
              "name": "paused",
              "type": "bool"
            }
          ]
        }
      },
      {
        "name": "rewardEntry",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "lastClaimedNonce",
              "type": "u64"
            },
            {
              "name": "lastClaimedTimestamp",
              "type": "i64"
            }
          ]
        }
      }
    ]
  };
  