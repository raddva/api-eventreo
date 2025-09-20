const generate = require("nanoid/generate");

export const getId = (): string => {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  return generate(alphabet, 5);
};
