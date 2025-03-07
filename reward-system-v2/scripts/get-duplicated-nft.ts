import { Connection, PublicKey } from "@solana/web3.js";
import { TOKEN_2022_PROGRAM_ID, getMint } from "@solana/spl-token";
import fs from 'fs';
import path from 'path';

const BATCH_SIZE = 3;
const DELAY_BETWEEN_BATCHES = 2000;
const DELAY_BETWEEN_REQUESTS = 200;
const MAX_RETRIES = 5;
const INITIAL_RETRY_DELAY = 1000;
const MAX_WALLETS_TO_PROCESS = 10;

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const execute = async () => {
    console.log('Starting script...');
    const connection = new Connection("https://mainnet.helius-rpc.com/?api-key=f1447b45-dbed-4220-bbea-64acb04b3404", {
        commitment: 'confirmed',
    });

    // Log the current directory and file path
    const currentDir = process.cwd();
    console.log('Current directory:', currentDir);
    
    const inputPath = path.join(currentDir, 'reward-system-v2/json/tx_trackers.json');
    console.log('Reading from:', inputPath);

    // Verificar si el archivo existe
    if (!fs.existsSync(inputPath)) {
        console.error('Error: File not found:', inputPath);
        return;
    }

    console.log('File exists, reading JSON...');
    
    // Leer el archivo JSON completo
    const transactions = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
    console.log(`Found ${transactions.length} transactions`);

    // Extraer wallets únicas
    const relevantWallets = new Set<string>();
    
    transactions.forEach((transaction: any, index: number) => {
        if (transaction.tx_context?.walletAddress) {
            relevantWallets.add(transaction.tx_context.walletAddress);
            
            // Log primeras 5 wallets encontradas
            if (relevantWallets.size <= 5) {
                console.log(`Found wallet: ${transaction.tx_context.walletAddress}`);
                console.log(`Transaction type: ${transaction.transaction_type}`);
            }
            
            if (relevantWallets.size >= MAX_WALLETS_TO_PROCESS) {
                console.log('Reached maximum number of wallets to process');
                return;
            }
        }
    });

    console.log(`\nTotal transactions processed: ${transactions.length}`);
    console.log(`Total relevant wallets found: ${relevantWallets.size}`);

    const walletsArray = Array.from(relevantWallets);
    console.log(`\nWallets found:`, walletsArray);
    console.log(`Processing ${walletsArray.length} wallets`);

    const results: any[] = [];
    const duplicateWalletsSummary: {
        walletAddress: string;
        duplicates: {
            name: string;
            count: number;
            mints: string[];
        }[];
    }[] = [];

    // Process wallets in batches
    for (let i = 0; i < walletsArray.length; i += BATCH_SIZE) {
        const batch = walletsArray.slice(i, i + BATCH_SIZE);
        console.log(`\nProcessing batch ${Math.floor(i/BATCH_SIZE) + 1} of ${Math.ceil(walletsArray.length/BATCH_SIZE)}`);

        const batchResults = await Promise.all(
            batch.map(async (walletAddress) => {
                try {
                    const result = await processWallet(connection, walletAddress);
                    if (result) {
                        duplicateWalletsSummary.push(result);
                        
                        // Guardar inmediatamente después de encontrar duplicados
                        fs.writeFileSync(
                            'duplicate-wallets-summary.json',
                            JSON.stringify({
                                totalWalletsProcessed: i + batch.length,
                                walletsWithDuplicates: duplicateWalletsSummary.length,
                                lastUpdated: new Date().toISOString(),
                                wallets: duplicateWalletsSummary
                            }, null, 2)
                        );

                        // Crear un resumen en texto plano
                        const textSummary = duplicateWalletsSummary.map(wallet => {
                            const duplicatesList = wallet.duplicates.map(dupe => 
                                `    - ${dupe.name}: ${dupe.count} copies (Mints: ${dupe.mints.join(', ')})`
                            ).join('\n');
                            
                            return `Wallet: ${wallet.walletAddress}\n${duplicatesList}\n`;
                        }).join('\n');

                        fs.writeFileSync(
                            'duplicate-wallets-summary.txt',
                            `NFT Duplicates Summary\n` +
                            `Last Updated: ${new Date().toISOString()}\n` +
                            `Total wallets processed: ${i + batch.length}\n` +
                            `Wallets with duplicates: ${duplicateWalletsSummary.length}\n\n` +
                            `=== Detailed Summary ===\n\n${textSummary}`
                        );
                    }
                    return result;
                } catch (error) {
                    console.error(`Error processing wallet ${walletAddress}:`, error);
                    return null;
                }
            })
        );

        // Add valid results to our array
        results.push(...batchResults.filter(r => r !== null));

        if (i + BATCH_SIZE < walletsArray.length) {
            console.log(`Waiting ${DELAY_BETWEEN_BATCHES/1000} seconds before next batch...`);
            await sleep(DELAY_BETWEEN_BATCHES);
        }
    }

    // Log final summary
    console.log('\nProcessing complete.');
    console.log(`Total wallets processed: ${walletsArray.length}`);
    console.log(`Wallets with duplicates: ${duplicateWalletsSummary.length}`);
    console.log('Summary saved to: duplicate-wallets-summary.json and duplicate-wallets-summary.txt');

    // Guardar resumen final
    fs.writeFileSync(
        'duplicate-wallets-final-summary.txt',
        `NFT Duplicates Final Summary\n` +
        `Generated on: ${new Date().toISOString()}\n` +
        `Total wallets processed: ${walletsArray.length}\n` +
        `Wallets with duplicates: ${duplicateWalletsSummary.length}\n\n` +
        `=== Wallets with Duplicates ===\n\n` +
        duplicateWalletsSummary.map(wallet => wallet.walletAddress).join('\n')
    );
};

async function retryWithBackoff(operation: () => Promise<any>, retries = MAX_RETRIES, delay = INITIAL_RETRY_DELAY) {
    try {
        return await operation();
    } catch (error) {
        if (retries === 0 || !error.message.includes('429')) {
            throw error;
        }
        console.log(`Rate limit hit. Retrying after ${delay}ms delay...`);
        await sleep(delay);
        return retryWithBackoff(operation, retries - 1, delay * 2);
    }
}

async function processWallet(connection: Connection, walletAddress: string) {
    try {
        console.log(`\nAnalyzing wallet: ${walletAddress}`);
        
        // Add delay before getting token accounts
        await sleep(DELAY_BETWEEN_REQUESTS);
        
        const tokenAccounts = await retryWithBackoff(() => 
            connection.getParsedTokenAccountsByOwner(
                new PublicKey(walletAddress),
                { programId: TOKEN_2022_PROGRAM_ID }
            )
        );

        const nftMetadata: { [key: string]: { count: number, mints: string[] } } = {};

        // Process token accounts with delays
        for (const tokenAccount of tokenAccounts.value) {
            const mint = tokenAccount.account.data.parsed.info.mint;
            
            try {
                await sleep(DELAY_BETWEEN_REQUESTS);
                
                const mintInfo = await retryWithBackoff(() =>
                    getMint(
                        connection,
                        new PublicKey(mint),
                        'confirmed',
                        TOKEN_2022_PROGRAM_ID
                    )
                );

                if (mintInfo.tlvData) {
                    const metadata = parseMintMetadata(mintInfo.tlvData);
                    if (metadata && metadata.name) {
                        if (!nftMetadata[metadata.name]) {
                            nftMetadata[metadata.name] = { count: 0, mints: [] };
                        }
                        nftMetadata[metadata.name].count++;
                        nftMetadata[metadata.name].mints.push(mint);
                    }
                }
                
            } catch (error) {
                console.log(`Skipping mint ${mint}: ${error.message}`);
                await sleep(500);
                continue;
            }
        }

        const duplicates = Object.entries(nftMetadata)
            .filter(([_, data]) => data.count > 1);

        if (duplicates.length > 0) {
            console.log(`Found duplicates in wallet ${walletAddress}:`);
            duplicates.forEach(([name, data]) => {
                console.log(`  "${name}": ${data.count} copies`);
                console.log(`   Mint addresses: ${data.mints.join(', ')}`);
            });

            return {
                walletAddress,
                duplicates: duplicates.map(([name, data]) => ({
                    name,
                    count: data.count,
                    mints: data.mints
                }))
            };
        } else {
            console.log(`No duplicates found in wallet ${walletAddress}`);
            return null;
        }

    } catch (error) {
        console.error(`Error processing wallet ${walletAddress}:`, error);
        return null;
    }
}

function parseMintMetadata(tlvData: Buffer) {
    let offset = 0;
    
    while (offset < tlvData.length) {
        const type = tlvData.readUInt16LE(offset);
        offset += 2;
        const length = tlvData.readUInt16LE(offset);
        offset += 2;

        if (type === 19) { // Metadata type
            const metadataStart = offset + 64;

            const nameLength = tlvData.readUInt32LE(metadataStart);
            const name = tlvData.slice(metadataStart + 4, metadataStart + 4 + nameLength).toString('utf8');

            const symbolStart = metadataStart + 4 + nameLength;
            const symbolLength = tlvData.readUInt32LE(symbolStart);
            const symbol = tlvData.slice(symbolStart + 4, symbolStart + 4 + symbolLength).toString('utf8');

            const uriStart = symbolStart + 4 + symbolLength;
            const uriLength = tlvData.readUInt32LE(uriStart);
            const uri = tlvData.slice(uriStart + 4, uriStart + 4 + uriLength).toString('utf8');

            return { name, symbol, uri };
        }
        offset += length;
    }
    return null;
}

execute().catch(console.error);
