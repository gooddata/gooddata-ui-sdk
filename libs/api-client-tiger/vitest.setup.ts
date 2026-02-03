// (C) 2023-2026 GoodData Corporation

// Fail test on console error (react proptypes validation etc.)
const consoleError = console.error;
console.error = (err, ...args) => {
    consoleError(err, ...args);
    throw new Error(err);
};
