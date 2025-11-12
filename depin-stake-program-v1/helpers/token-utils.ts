export const convertToTokenAmount = (amount: number): number => {
    // Convert to token amount with 6 decimals
    return Math.floor(amount * Math.pow(10, 6));
};
