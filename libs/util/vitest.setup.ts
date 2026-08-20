// (C) 2023-2026 GoodData Corporation

// Fail test on console error (react proptypes validation etc.)
// With test isolation disabled the setup file is evaluated once per test file within the same
// worker environment, so guard the patching to avoid stacking wrappers on top of each other.
const PATCHED = Symbol.for("gooddata.util.consoleErrorPatched");

if (!(console.error as unknown as Record<symbol, boolean>)[PATCHED]) {
    const consoleError = console.error;
    const failingConsoleError = (err: unknown, ...args: unknown[]) => {
        consoleError(err, ...args);
        throw new Error(String(err));
    };
    (failingConsoleError as unknown as Record<symbol, boolean>)[PATCHED] = true;
    console.error = failingConsoleError;
}
