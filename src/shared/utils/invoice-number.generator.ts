export const generateInvoiceNumber = (): string => {
    const prefix = 'INV';
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const randomPart = Math.floor(1000 + Math.random() * 9000).toString();
    return `${prefix}-${year}${month}-${randomPart}`;
  };