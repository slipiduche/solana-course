

export const convertToTokenAmount = (amount: number, decimals: number = 6) => {
    return Math.round(amount * Math.pow(10, decimals));
  };