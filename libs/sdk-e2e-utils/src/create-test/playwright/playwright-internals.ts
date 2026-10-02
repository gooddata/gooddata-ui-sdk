// (C) 2026 GoodData Corporation

import { fileURLToPath } from "url";

import type { PlaywrightTest } from "./playwright-types.js";

// Playwright's public `test`, `test.describe`, `test.skip`, ... record the source location of their
// *direct* caller. Called from our wrappers in `factory.ts`, that would be `factory.ts` itself, which
// breaks `testInfo.file`, reporter locations and running a test by line. So the wrappers call
// Playwright's private `TestTypeImpl` methods instead, which take the location as an argument.
//
// These are Playwright internals, verified against @playwright/test 1.62.1 (pinned in package.json).
// `getPlaywrightInternals` throws if they're missing, so an upgrade that changes them fails loudly.

/**
 * Source location Playwright records for tests, describes and modifiers.
 */
export interface IPlaywrightLocation {
    file: string;
    line: number;
    column: number;
}

export type PlaywrightCreateTestType = "default" | "only" | "fail.only";
export type PlaywrightModifierType = "skip" | "fixme" | "fail";
export type PlaywrightDescribeType =
    | "default"
    | "only"
    | "skip"
    | "fixme"
    | "serial"
    | "serial.only"
    | "parallel"
    | "parallel.only";

export interface IPlaywrightInternals {
    /** Same as `test(...)`, `test.only(...)`, `test.fail.only(...)`. */
    createTest(type: PlaywrightCreateTestType, location: IPlaywrightLocation, ...args: unknown[]): void;
    /** Same as `test.skip(...)`, `test.fixme(...)`, `test.fail(...)`, in both their title and title-less forms. */
    modifier(type: PlaywrightModifierType, location: IPlaywrightLocation, ...args: unknown[]): void;
    /** Same as `test.describe(...)` and its variants. */
    describe(type: PlaywrightDescribeType, location: IPlaywrightLocation, ...args: unknown[]): void;
}

interface ITestTypeImpl {
    _createTest(type: string, location: IPlaywrightLocation, ...args: unknown[]): void;
    _modifier(type: string, location: IPlaywrightLocation, ...args: unknown[]): void;
    _describe(type: string, location: IPlaywrightLocation, ...args: unknown[]): void;
}

function isTestTypeImpl(value: unknown): value is ITestTypeImpl {
    if (typeof value !== "object" || value === null) {
        return false;
    }
    const impl = value as Partial<Record<keyof ITestTypeImpl, unknown>>;
    return (
        typeof impl._createTest === "function" &&
        typeof impl._modifier === "function" &&
        typeof impl._describe === "function"
    );
}

/**
 * Get the private `TestTypeImpl` behind a Playwright `test` function.
 */
export function getPlaywrightInternals(testInstance: PlaywrightTest): IPlaywrightInternals {
    // Playwright stores it under a module-private `Symbol("testType")`, so look it up by description.
    const symbol = Object.getOwnPropertySymbols(testInstance).find((s) => s.description === "testType");
    const impl: unknown = symbol ? (testInstance as unknown as Record<symbol, unknown>)[symbol] : undefined;

    if (!isTestTypeImpl(impl)) {
        throw new Error(
            "@gooddata/sdk-e2e-utils: Playwright internals (TestTypeImpl._createTest/_modifier/_describe) " +
                "were not found. They changed in this @playwright/test version; update " +
                "src/create-test/playwright/playwright-internals.ts.",
        );
    }

    return {
        createTest: (type, location, ...args) => impl._createTest(type, location, ...args),
        modifier: (type, location, ...args) => impl._modifier(type, location, ...args),
        describe: (type, location, ...args) => impl._describe(type, location, ...args),
    };
}

// This package's code: compiled (`esm/`) and, when source-mapped, original (`src/`). Frames from here are our own wrappers.
const OWN_CODE_DIRS = ["../../../esm/", "../../../src/"].map((dir) =>
    fileURLToPath(new URL(dir, import.meta.url)),
);

// Matches the location at the end of a stack line: "at fn (/path/file.ts:12:3)", "at /path/file.ts:12:3",
// "at fn (file:///path/file.ts:12:3)".
const STACK_FRAME_LOCATION = /\(?((?:file:\/\/)?[^\s()]+):(\d+):(\d+)\)?$/;

/**
 * Location of the first stack frame outside this package, i.e. the spec file (or consumer helper)
 * that called our wrapper. Same frame Playwright's public API would have recorded.
 *
 * Playwright installs source-map-support while loading test files, so the stack already shows
 * the original TypeScript file and line.
 */
export function getCallerLocation(): IPlaywrightLocation {
    const stack = new Error().stack ?? "";

    for (const stackLine of stack.split("\n").slice(1)) {
        const match = STACK_FRAME_LOCATION.exec(stackLine.trim());
        if (!match) {
            continue;
        }

        const file = match[1].startsWith("file://") ? fileURLToPath(match[1]) : match[1];
        if (OWN_CODE_DIRS.some((dir) => file.startsWith(dir)) || file.startsWith("node:")) {
            continue;
        }

        return { file, line: Number(match[2]), column: Number(match[3]) };
    }

    throw new Error("@gooddata/sdk-e2e-utils: could not determine the caller location from the stack.");
}
