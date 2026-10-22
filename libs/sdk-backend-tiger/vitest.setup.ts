// (C) 2023-2026 GoodData Corporation

import { afterAll, afterEach, beforeEach, vi } from "vitest";

// Tests run non-isolated, so this setup file is evaluated repeatedly within a single worker. Keep a
// reference to the pristine console.error on globalThis so that repeated evaluations never wrap an
// already wrapped implementation.
const globalWithConsole = globalThis as typeof globalThis & {
    __originalConsoleError__?: typeof console.error;
};
globalWithConsole.__originalConsoleError__ ??= console.error;
const consoleError = globalWithConsole.__originalConsoleError__;

// Fail test on console error (react proptypes validation etc.)
beforeEach(() => {
    console.error = (err, ...args) => {
        consoleError(err, ...args);
        throw new Error(err);
    };
});

afterEach(() => {
    console.error = consoleError;
});

// Without isolation, modules stay cached across the test files of a worker. A module evaluated under
// one file's vi.mock would otherwise keep that mock for every later file that imports it.
afterAll(() => {
    vi.resetModules();
});
