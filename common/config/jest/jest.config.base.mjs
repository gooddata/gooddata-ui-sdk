export default {
    transform: {
      "\\.[jt]sx?$": ['ts-jest', { "useESM": true }],
    },
    
    moduleNameMapper: {
      "(.+)\\.js": "$1"
    },
    extensionsToTreatAsEsm: [".ts"],

    testTimeout: 20000, // This timeout was added because we have flaky tests that ended up with timeouts. more info: https://github.com/facebook/jest/issues/11607

    snapshotFormat: {
        escapeString: true,
        printBasicPrototype: true
    }
};