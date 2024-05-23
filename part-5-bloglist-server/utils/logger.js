const notInTestMode =
  (fn) =>
  (...args) => {
    if (process.env.NODE_ENV !== "test") fn(...args);
  };

const info = notInTestMode((...args) => console.log(...args));
const error = notInTestMode((...args) => console.error(...args));

module.exports = { info, error };
