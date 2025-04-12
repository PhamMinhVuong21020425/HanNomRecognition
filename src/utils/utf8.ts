// Encode UTF-8 string to binary
export const encodeUTF8 = (str: string) => {
  const binaryStr = Buffer.from(str, 'utf8').toString('binary');
  return encodeURIComponent(binaryStr);
};

// Decode binary to UTF-8 string
export const decodeUTF8 = (str: string) => {
  const binaryStr = decodeURIComponent(str);
  return Buffer.from(binaryStr, 'binary').toString('utf8');
};
