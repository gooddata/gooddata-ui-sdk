// (C) 2019 GoodData Corporation
const consoleError = console.error;
console.error = (err, ...args) => {
    consoleError(err, ...args);
    throw new Error(err);
};
