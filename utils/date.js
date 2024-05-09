const formatNumber = (num) => {
  const n = num.toString();
  return n[1] ? n : `0${n}`;
};

const formatTime = (timestamp) => {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours();
  const minute = date.getMinutes();
  const second = date.getSeconds();
  return `${[year, month, day].map(formatNumber).join("/")} ${[
    hour,
    minute,
    second,
  ]
    .map(formatNumber)
    .join(":")}`;
};

const formatDay = (timestamp) => {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return [year, month, day].map(formatNumber).join("-");
};

const formatT = (timestamp, type) => {
  const date = new Date(timestamp);
  switch (type) {
    case "year":
      return date.getFullYear();
    case "month": 
      return date.getMonth() + 1;
    default:
      return date.getDate();
  }
};

module.exports = { formatTime, formatDay, formatT };
