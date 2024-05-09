const isJSON = (val) => {
  const isString = typeof val === "string" || val instanceof String;
  if (!isString) return false;
  try {
    JSON.parse(val);
    return true;
    // const obj = JSON.parse(val);
    // return !!obj && typeof obj === "object";
  } catch (e) {
    /* ignore */
  }
  return false;
};

const stringify = (val) => (isJSON(val) ? val : JSON.stringify(val));
const parse = (val) => (isJSON(val) ? JSON.parse(val) : val);

const jsonClone = (val) => JSON.parse(JSON.stringify(val));

module.exports = { isJSON, stringify, parse, jsonClone };
