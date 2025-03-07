import fs from 'fs';
import path from 'path';
import readline from 'readline';

const splitJsonStream = async () => {
    try {
        // Setup paths
        const inputPath = path.join(__dirname, '../json/tx_trackers.json');
        const outputDir = path.join(__dirname, '../json/chunks');
        
        // Create output directory if it doesn't exist
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        // First, count total lines to calculate chunk sizes
        let totalItems = 0;
        const fileStream = fs.createReadStream(inputPath, { encoding: 'utf8' });
        const rl = readline.createInterface({
            input: fileStream,
            crlfDelay: Infinity
        });

        // Count items in the JSON array
        for await (const line of rl) {
            if (line.trim() === '[' || line.trim() === ']') continue;
            if (line.trim().length > 0) totalItems++;
        }

        const itemsPerChunk = Math.ceil(totalItems / 5);
        console.log(`Total items: ${totalItems}`);
        console.log(`Items per chunk: ${itemsPerChunk}`);

        // Reset file stream for actual processing
        const readStream = fs.createReadStream(inputPath, { encoding: 'utf8' });
        const reader = readline.createInterface({
            input: readStream,
            crlfDelay: Infinity
        });

        let currentChunk = 1;
        let currentChunkItems = 0;
        let writeStream = fs.createWriteStream(path.join(outputDir, `tx_trackers_${currentChunk}.json`));
        writeStream.write('[\n');

        for await (let line of reader) {
            // Skip array brackets
            if (line.trim() === '[' || line.trim() === ']') continue;
            
            // Clean up the line
            line = line.trim();
            if (line.endsWith(',')) line = line.slice(0, -1);
            if (line.length === 0) continue;

            // Write to current chunk
            if (currentChunkItems > 0) {
                writeStream.write(',\n');
            }
            writeStream.write(line);
            currentChunkItems++;

            // Check if we need to start a new chunk
            if (currentChunkItems >= itemsPerChunk && currentChunk < 5) {
                // Close current chunk
                writeStream.write('\n]');
                writeStream.end();
                console.log(`Chunk ${currentChunk} created with ${currentChunkItems} items`);

                // Start new chunk
                currentChunk++;
                currentChunkItems = 0;
                writeStream = fs.createWriteStream(path.join(outputDir, `tx_trackers_${currentChunk}.json`));
                writeStream.write('[\n');
            }
        }

        // Close the last chunk
        writeStream.write('\n]');
        writeStream.end();
        console.log(`Chunk ${currentChunk} created with ${currentChunkItems} items`);
        console.log('\nSplit complete! Files created in json/chunks/ directory');

    } catch (error) {
        console.error('Error splitting JSON:', error);
    }
};

splitJsonStream(); 