import { getWalletFromUnit8Array } from '../helpers/keypair';
import { PublicKey, Connection } from '@solana/web3.js';
import { 
    getAssociatedTokenAddress, 
    createTransferInstruction,
    createAssociatedTokenAccountInstruction 
} from '@solana/spl-token';
import { BN } from 'bn.js';
import { TOKENS, DECIMALS, MALICIOUS_USER2_PRIVATEKEY } from '../constants';
import { Transaction, sendAndConfirmTransaction } from '@solana/web3.js';
import { convertToTokenAmount } from '../../reward-system/utils/token';

const executeSendTokens = async () => {
    // Configuración inicial
    const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
    const senderKeypair = getWalletFromUnit8Array(MALICIOUS_USER2_PRIVATEKEY);
    
    // Configuración del token y cantidad
    const mint = new PublicKey(TOKENS.WAYRU.REWARD_TOKEN_MINT);
    const amount = new BN(convertToTokenAmount(4900, DECIMALS)); // Ejemplo: enviar 100 tokens
    const recipientAddress = new PublicKey('4MvgWq37e76evY9aB9Lp9NoNGfBHSz3zJ1PzDpDnXMUP');

    try {
        // Obtener las direcciones de las cuentas asociadas
        const senderTokenAccount = await getAssociatedTokenAddress(
            mint,
            senderKeypair.publicKey
        );

        const recipientTokenAccount = await getAssociatedTokenAddress(
            mint,
            recipientAddress
        );

        // Crear una nueva transacción
        const transaction = new Transaction();

        // Verificar si la cuenta del destinatario existe
        const recipientAccountInfo = await connection.getAccountInfo(recipientTokenAccount);
        
        // Si la cuenta no existe, agregar instrucción para crearla
        if (!recipientAccountInfo) {
            transaction.add(
                createAssociatedTokenAccountInstruction(
                    senderKeypair.publicKey,    // Pagador
                    recipientTokenAccount,       // ATA a crear
                    recipientAddress,            // Propietario de la ATA
                    mint                         // Mint del token
                )
            );
        }

        // Agregar la instrucción de transferencia
        transaction.add(
            createTransferInstruction(
                senderTokenAccount,
                recipientTokenAccount,
                senderKeypair.publicKey,
                amount.toNumber()
            )
        );

        // Enviar la transacción
        const signature = await sendAndConfirmTransaction(
            connection,
            transaction,
            [senderKeypair]
        );

        console.log(`Transferencia exitosa de ${amount} tokens a ${recipientAddress.toString()}`);
        console.log(`Signature: ${signature}`);
    } catch (error) {
        console.error('Error al enviar tokens:', error);
    }
}

// Ejecutar la función
executeSendTokens().then(
    () => process.exit(0)
).catch((error) => {
    console.error(error);
    process.exit(1);
});
