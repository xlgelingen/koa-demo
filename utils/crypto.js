const crypto = require("crypto");
const configs = require("../config");

// scrypt 密码哈希封装
const scrypt = async (password, salt = configs.CRYPTO_KEY, keylen = 64) => {
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, keylen, (err, derivedKey) => {
      if (err) reject(err);
      else resolve(derivedKey.toString("base64"));
    });
  });
};

// 通用加解密封装
const encrypt = (str, ...params) => {
  const cipher = crypto.createCipheriv(...params);
  let enc = cipher.update(str, "utf8", "hex");
  enc += cipher.final("hex");
  return enc;
};
const decrypt = (str, ...params) => {
  const cipher = crypto.createDecipheriv(...params);
  let dec = cipher.update(str, "hex", "utf8");
  dec += cipher.final("utf8");
  return dec;
};

// 系统加密/解密
const key = Buffer.from(configs.CRYPTO_KEY, "utf8");
const iv = Buffer.from(configs.CRYPTO_IV, "utf8");
const encipher = (str) => encrypt(str, "aes-256-cbc", key, iv);
const decipher = (str) => decrypt(str, "aes-256-cbc", key, iv);

module.exports = { scrypt, encipher, decipher };
