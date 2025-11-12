export type BoostStake = {
    address: "2W41afA7PC45mmmbDfsBanKr2s4ac8EPJLrL1DKdxLj9";
    metadata: {
        name: "boost_stake";
        version: "0.1.0";
        spec: "0.1.0";
        description: "Created with Anchor";
    };
    instructions: [
        {
            name: "accept_admin_request";
            discriminator: [81, 254, 219, 141, 109, 117, 12, 67];
            accounts: [
                { name: "user"; writable: true; signer: true },
                {
                    name: "admin_account";
                    writable: true;
                    pda: {
                        seeds: [
                            {
                                kind: "const";
                                value: [
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
                                ];
                            }
                        ];
                    };
                }
            ];
            args: [];
        },
        {
            name: "add_mint_authority";
            discriminator: [41, 254, 251, 123, 155, 68, 213, 8];
            accounts: [
                { name: "user"; writable: true; signer: true },
                {
                    name: "admin_account";
                    writable: true;
                    pda: {
                        seeds: [
                            {
                                kind: "const";
                                value: [
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
                                ];
                            }
                        ];
                    };
                }
            ];
            args: [{ name: "new_mint_authority"; type: "pubkey" }];
        },
        {
            name: "deposit_tokens";
            discriminator: [176, 83, 229, 18, 191, 143, 176, 150];
            accounts: [
                { name: "user"; writable: true; signer: true },
                { name: "token_mint" },
                { name: "nft_mint_address" },
                { name: "user_nft_token_account" },
                {
                    name: "nfnode_entry";
                    writable: true;
                    pda: {
                        seeds: [
                            {
                                kind: "const";
                                value: [
                                    110,
                                    102,
                                    110,
                                    111,
                                    100,
                                    101,
                                    95,
                                    101,
                                    110,
                                    116,
                                    114,
                                    121
                                ];
                            },
                            { kind: "account"; path: "nft_mint_address" }
                        ];
                    };
                },
                {
                    name: "admin_account";
                    writable: true;
                    pda: {
                        seeds: [
                            {
                                kind: "const";
                                value: [
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
                                ];
                            }
                        ];
                    };
                },
                {
                    name: "token_storage_authority";
                    writable: true;
                    pda: {
                        seeds: [
                            {
                                kind: "const";
                                value: [
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
                                ];
                            },
                            { kind: "account"; path: "nft_mint_address" }
                        ];
                    };
                },
                {
                    name: "token_storage_account";
                    writable: true;
                    pda: {
                        seeds: [
                            { kind: "account"; path: "token_storage_authority" },
                            {
                                kind: "const";
                                value: [
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
                                ];
                            },
                            { kind: "account"; path: "token_mint" }
                        ];
                        program: {
                            kind: "const";
                            value: [
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
                            ];
                        };
                    };
                },
                {
                    name: "user_token_account";
                    writable: true;
                    pda: {
                        seeds: [
                            { kind: "account"; path: "user" },
                            {
                                kind: "const";
                                value: [
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
                                ];
                            },
                            { kind: "account"; path: "token_mint" }
                        ];
                        program: {
                            kind: "const";
                            value: [
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
                            ];
                        };
                    };
                },
                { name: "token_program_2022" },
                {
                    name: "token_program";
                    address: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";
                },
                {
                    name: "associated_token_program";
                    address: "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL";
                },
                { name: "system_program"; address: "11111111111111111111111111111111" }
            ];
            args: [{ name: "amount"; type: "u64" }];
        },
        {
            name: "initialize_nfnode";
            discriminator: [51, 110, 148, 151, 182, 151, 64, 104];
            accounts: [
                { name: "user"; writable: true; signer: true },
                { name: "token_mint" },
                { name: "nft_mint_address" },
                { name: "user_nft_token_account" },
                {
                    name: "nfnode_entry";
                    writable: true;
                    pda: {
                        seeds: [
                            {
                                kind: "const";
                                value: [
                                    110,
                                    102,
                                    110,
                                    111,
                                    100,
                                    101,
                                    95,
                                    101,
                                    110,
                                    116,
                                    114,
                                    121
                                ];
                            },
                            { kind: "account"; path: "nft_mint_address" }
                        ];
                    };
                },
                {
                    name: "admin_account";
                    writable: true;
                    pda: {
                        seeds: [
                            {
                                kind: "const";
                                value: [
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
                                ];
                            }
                        ];
                    };
                },
                {
                    name: "token_storage_authority";
                    writable: true;
                    pda: {
                        seeds: [
                            {
                                kind: "const";
                                value: [
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
                                ];
                            },
                            { kind: "account"; path: "nft_mint_address" }
                        ];
                    };
                },
                {
                    name: "token_storage_account";
                    writable: true;
                    pda: {
                        seeds: [
                            { kind: "account"; path: "token_storage_authority" },
                            {
                                kind: "const";
                                value: [
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
                                ];
                            },
                            { kind: "account"; path: "token_mint" }
                        ];
                        program: {
                            kind: "const";
                            value: [
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
                            ];
                        };
                    };
                },
                {
                    name: "user_token_account";
                    writable: true;
                    pda: {
                        seeds: [
                            { kind: "account"; path: "user" },
                            {
                                kind: "const";
                                value: [
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
                                ];
                            },
                            { kind: "account"; path: "token_mint" }
                        ];
                        program: {
                            kind: "const";
                            value: [
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
                            ];
                        };
                    };
                },
                { name: "token_program_2022" },
                {
                    name: "token_program";
                    address: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";
                },
                {
                    name: "associated_token_program";
                    address: "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL";
                },
                { name: "system_program"; address: "11111111111111111111111111111111" }
            ];
            args: [{ name: "amount"; type: "u64" }];
        },
        {
            name: "initialize_system";
            discriminator: [50, 173, 248, 140, 202, 35, 141, 150];
            accounts: [
                { name: "user"; writable: true; signer: true },
                {
                    name: "admin_account";
                    writable: true;
                    pda: {
                        seeds: [
                            {
                                kind: "const";
                                value: [
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
                                ];
                            }
                        ];
                    };
                },
                { name: "mint_authority" },
                { name: "token_mint" },
                {
                    name: "token_program";
                    address: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";
                },
                {
                    name: "program";
                    address: "2W41afA7PC45mmmbDfsBanKr2s4ac8EPJLrL1DKdxLj9";
                },
                { name: "program_data" },
                { name: "system_program"; address: "11111111111111111111111111111111" }
            ];
            args: [];
        },
        {
            name: "pause_program";
            discriminator: [91, 86, 253, 175, 66, 236, 172, 124];
            accounts: [
                { name: "user"; writable: true; signer: true },
                {
                    name: "admin_account";
                    writable: true;
                    pda: {
                        seeds: [
                            {
                                kind: "const";
                                value: [
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
                                ];
                            }
                        ];
                    };
                }
            ];
            args: [];
        },
        {
            name: "remove_mint_authority";
            discriminator: [33, 207, 52, 111, 106, 97, 9, 63];
            accounts: [
                { name: "user"; writable: true; signer: true },
                {
                    name: "admin_account";
                    writable: true;
                    pda: {
                        seeds: [
                            {
                                kind: "const";
                                value: [
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
                                ];
                            }
                        ];
                    };
                }
            ];
            args: [{ name: "mint_authority"; type: "pubkey" }];
        },
        {
            name: "unpause_program";
            discriminator: [43, 162, 233, 92, 254, 62, 69, 58];
            accounts: [
                { name: "user"; writable: true; signer: true },
                {
                    name: "admin_account";
                    writable: true;
                    pda: {
                        seeds: [
                            {
                                kind: "const";
                                value: [
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
                                ];
                            }
                        ];
                    };
                }
            ];
            args: [];
        },
        {
            name: "update_admin_request";
            discriminator: [58, 118, 170, 225, 117, 36, 203, 167];
            accounts: [
                { name: "user"; writable: true; signer: true },
                {
                    name: "admin_account";
                    writable: true;
                    pda: {
                        seeds: [
                            {
                                kind: "const";
                                value: [
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
                                ];
                            }
                        ];
                    };
                }
            ];
            args: [{ name: "new_admin_pubkey"; type: "pubkey" }];
        },
        {
            name: "withdraw_tokens";
            discriminator: [2, 4, 225, 61, 19, 182, 106, 170];
            accounts: [
                { name: "user"; writable: true; signer: true },
                { name: "token_mint" },
                { name: "nft_mint_address" },
                { name: "user_nft_token_account" },
                {
                    name: "nfnode_entry";
                    writable: true;
                    pda: {
                        seeds: [
                            {
                                kind: "const";
                                value: [
                                    110,
                                    102,
                                    110,
                                    111,
                                    100,
                                    101,
                                    95,
                                    101,
                                    110,
                                    116,
                                    114,
                                    121
                                ];
                            },
                            { kind: "account"; path: "nft_mint_address" }
                        ];
                    };
                },
                {
                    name: "admin_account";
                    writable: true;
                    pda: {
                        seeds: [
                            {
                                kind: "const";
                                value: [
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
                                ];
                            }
                        ];
                    };
                },
                {
                    name: "token_storage_authority";
                    writable: true;
                    pda: {
                        seeds: [
                            {
                                kind: "const";
                                value: [
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
                                ];
                            },
                            { kind: "account"; path: "nft_mint_address" }
                        ];
                    };
                },
                {
                    name: "token_storage_account";
                    writable: true;
                    pda: {
                        seeds: [
                            { kind: "account"; path: "token_storage_authority" },
                            {
                                kind: "const";
                                value: [
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
                                ];
                            },
                            { kind: "account"; path: "token_mint" }
                        ];
                        program: {
                            kind: "const";
                            value: [
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
                            ];
                        };
                    };
                },
                {
                    name: "user_token_account";
                    writable: true;
                    pda: {
                        seeds: [
                            { kind: "account"; path: "user" },
                            {
                                kind: "const";
                                value: [
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
                                ];
                            },
                            { kind: "account"; path: "token_mint" }
                        ];
                        program: {
                            kind: "const";
                            value: [
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
                            ];
                        };
                    };
                },
                { name: "token_program_2022" },
                {
                    name: "token_program";
                    address: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";
                },
                {
                    name: "associated_token_program";
                    address: "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL";
                },
                { name: "system_program"; address: "11111111111111111111111111111111" }
            ];
            args: [];
        }
    ];
    accounts: [
        {
            name: "AdminAccount";
            discriminator: [153, 119, 180, 178, 43, 66, 235, 148];
        },
        { name: "NfNodeEntry"; discriminator: [123, 252, 104, 177, 238, 42, 64, 0] }
    ];
    errors: [
        {
            code: 6000;
            name: "UnauthorizedAdmin";
            msg: "Unauthorized access admin.";
        },
        {
            code: 6001;
            name: "MissingAdminSignature";
            msg: "Missing admin signature.";
        },
        { code: 6002; name: "ProgramPaused"; msg: "Program is paused." },
        { code: 6003; name: "ArithmeticOverflow"; msg: "Aricmetic overflow." },
        { code: 6004; name: "InvalidNftMint"; msg: "Invalid NFT mint." },
        {
            code: 6005;
            name: "InsufficientNftBalance";
            msg: "Insufficient NFT balance.";
        },
        {
            code: 6006;
            name: "InvalidNftTokenAccount";
            msg: "Invalid Nft token account.";
        },
        { code: 6007; name: "InvalidNftSupply"; msg: "Invalid Nft supply." },
        { code: 6008; name: "InvalidNftDecimals"; msg: "Invalid Nft decimals." },
        {
            code: 6009;
            name: "SameAdminPubkey";
            msg: "New admin can't be the same current admin";
        },
        {
            code: 6010;
            name: "SameAdminCandidatePubkey";
            msg: "New admin can't be the same current admin candidate";
        },
        { code: 6011; name: "AlreadyAccepted"; msg: "Admin already accepted." },
        { code: 6012; name: "AlreadyPaused"; msg: "Program already paused." },
        { code: 6013; name: "AlreadyRunning"; msg: "Program already running." },
        { code: 6014; name: "InvalidPubkey"; msg: "Invalid pubkey." },
        {
            code: 6015;
            name: "InvalidDepositAmount";
            msg: "Deposit amount must be > 0 and total staked <= 100000000000.";
        },
        { code: 6016; name: "DepositAlreadyMade"; msg: "Deposit already made." },
        { code: 6017; name: "WithdrawAlreadyMade"; msg: "Withdraw already made." },
        { code: 6018; name: "WithdrawTooEarly"; msg: "Withdraw too early." },
        { code: 6019; name: "InvalidMint"; msg: "Invalid token mint." },
        {
            code: 6020;
            name: "UnauthorizedMintAuthority";
            msg: "Unauthorized Mint Authority.";
        },
        {
            code: 6021;
            name: "MintAuthorityAlreadyExists";
            msg: "Mint authority already exists.";
        },
        {
            code: 6022;
            name: "MintAuthorityNotFound";
            msg: "Mint authority not found.";
        },
        {
            code: 6023;
            name: "MintAuthorityListFull";
            msg: "Mint authority list is full.";
        }
    ];
    types: [
        {
            name: "AdminAccount";
            type: {
                kind: "struct";
                fields: [
                    { name: "admin_pubkey"; type: "pubkey" },
                    { name: "admin_candidate_pubkey"; type: "pubkey" },
                    { name: "paused"; type: "bool" },
                    { name: "admin_update_requested"; type: "bool" },
                    { name: "valid_mint"; type: "pubkey" },
                    { name: "mint_authorities"; type: { vec: "pubkey" } },
                    { name: "total_value_locked"; type: "u64" }
                ];
            };
        },
        {
            name: "NfNodeEntry";
            type: {
                kind: "struct";
                fields: [
                    { name: "deposit_amount"; type: "u64" },
                    { name: "deposit_timestamp"; type: "i64" }
                ];
            };
        }
    ];
};
