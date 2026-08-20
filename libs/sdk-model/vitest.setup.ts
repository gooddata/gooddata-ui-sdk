// (C) 2023-2026 GoodData Corporation

// Fail test on console error (react proptypes validation etc.)
// Tests run non-isolated, so this setup file may be evaluated repeatedly against the same
// `console` object - the flag keeps the patch from stacking on top of itself.
const patchedFlag = Symbol.for("gdc-sdk-model-console-error-patched");
const flagHolder = globalThis as unknown as Record<symbol, boolean | undefined>;

if (!flagHolder[patchedFlag]) {
    flagHolder[patchedFlag] = true;

    const consoleError = console.error;
    console.error = (err, ...args) => {
        consoleError(err, ...args);
        throw new Error(err);
    };
}
