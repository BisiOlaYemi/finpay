export const generateCardNumber = (): string => {
    const prefix = ['4', '5', '6'][Math.floor(Math.random() * 3)];
    const randomPart = Array.from(
      { length: 15 }, 
      () => Math.floor(Math.random() * 10)
    ).join('');
    return `${prefix}${randomPart}`;
  };