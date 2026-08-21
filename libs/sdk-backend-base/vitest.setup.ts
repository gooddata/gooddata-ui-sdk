// (C) 2023-2026 GoodData Corporation

import { afterEach, vi } from "vitest";

// Tests run with isolation disabled, so this setup file is evaluated once per test file within the
// same worker process. Guard the console patching so console.error is not wrapped over and over.
const GUARD = Symbol.for("@gooddata/sdk-backend-base/failOnConsoleError");
const globalWithGuard = globalThis as typeof globalThis & { [GUARD]?: true };

if (!globalWithGuard[GUARD]) {
    globalWithGuard[GUARD] = true;

    // Fail test on console error (react proptypes validation etc.)
    const consoleError = console.error;
    console.error = (err, ...args) => {
        consoleError(err, ...args);
        throw new Error(err);
    };
}

// Fake timers installed by a test are process-wide. Without isolation they would leak into every
// following test (and file) whenever a test fails before restoring them itself.
afterEach(() => {
    vi.useRealTimers();
});
