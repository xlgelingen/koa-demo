const NUMBERS = "0123456789";
const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
const SPECIALS = "~!@#$%^*()_+-=[]{}|;:,./<>?";

const randomString = (length, option) => {
  const opt = option || {};
  let len = length || 16;
  let chars = "";
  let result = "";

  if (opt === true) chars = NUMBERS + LETTERS + SPECIALS;
  else if (typeof opt == "string") chars = opt;
  else {
    if (opt.numbers !== false) chars += (typeof opt.numbers == "string") ? opt.numbers : NUMBERS;
    if (opt.letters !== false) chars += (typeof opt.letters == "string") ? opt.letters : LETTERS;
    if (opt.specials) chars += (typeof opt.specials == "string") ? opt.specials : SPECIALS;
  }

  while (len > 0) {
    const index = Math.floor(Math.random() * chars.length);
    result += chars[index];
    len--;
  }

  return result;
};

module.exports = { randomString };
