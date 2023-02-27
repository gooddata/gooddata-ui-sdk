// (C) 2018-2023 GoodData Corporation

// eslint-disable-next-line @typescript-eslint/no-var-requires
global.Blob = require("blob-polyfill").Blob;

// Fail test on console error (react proptypes validation etc.)
const consoleError = console.error;
console.error = (err, ...args) => {
    consoleError(err, ...args);
    throw new Error(err);
};
