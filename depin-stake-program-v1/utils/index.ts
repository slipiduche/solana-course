export const sleep = (seconds = 2) => new Promise((resolve) => setTimeout(resolve, seconds * 1000));

export const convertToTokenAmount = (amount: number, decimals: number = 6) => {
    return Math.round(amount * Math.pow(10, decimals));
};