export const generateAccountNumber = (): string => {
    const prefix = '5901';
    const randomPart = Math.floor(10000000 + Math.random() * 90000000).toString();
    return `${prefix}${randomPart}`;
  };