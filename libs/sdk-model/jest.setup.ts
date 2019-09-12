// (C) 2019 GoodData Corporation
// tslint:disable:no-console

const consoleError = console.error;
console.error = (err, ...args) => {
    consoleError(err, ...args);
    throw new Error(err);
};
