// (C) 2023-2025 GoodData Corporation

// Fail test on console error (react proptypes validation etc.)
const consoleError = console.error;
console.error = (err, ...args) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    consoleError(err, ...args);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    throw new Error(err);
};
