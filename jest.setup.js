// Temporary solution, see https://github.com/facebook/jest/issues/3251
let unhandledRejection;
process.on('unhandledRejection', (reason, promise) => {
    unhandledRejection = { reason, promise };
});

beforeEach(() => {
    unhandledRejection = null;
});

afterEach(() => {
    if (unhandledRejection) {
        console.error(unhandledRejection.promise);
        throw new Error(unhandledRejection.reason);
    }
});
