// (C) 2007-2026 GoodData Corporation

/* eslint-disable no-console */

/**
 * Returns a promise which will resolve after the provided number of milliseconds.
 *
 * @param timeout - resolve timeout in milliseconds
 * @internal
 */
export function delay(timeout = 0): Promise<void> {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve();
        }, timeout);
    });
}

/**
 * Property reads that the module plumbing (a mock registry, `await import(...)`, React, ...) performs on
 * a namespace object without meaning to read an export. They must answer `undefined` rather than trip
 * the guard in {@link strictBarrel}.
 */
const NAMESPACE_PROBES = new Set(["then", "default", "__esModule", "$$typeof", "toJSON", "constructor"]);

/**
 * Guards a hand-assembled stand-in for a package's barrel so that reaching for an export it does not
 * carry throws on the spot, naming the package and what is missing.
 *
 * @remarks
 * A test setup can cut a suite's import time by replacing a large barrel with the handful of real modules
 * it actually uses, reached directly. Left unguarded such a stand-in degrades silently: the day someone
 * imports something new out of that package the import resolves to `undefined`, and the failure surfaces
 * somewhere else entirely, in a test that has nothing to do with the change.
 *
 * @param packageName - name of the package whose barrel is being stood in for
 * @param exports - the exports the stand-in carries
 * @returns the exports, guarded against reads of anything they do not carry
 * @internal
 */
export function strictBarrel<T extends object>(packageName: string, exports: T): T {
    return new Proxy(exports, {
        get(target, property, receiver) {
            // Own properties only: a real module namespace inherits from nothing, so anything reached
            // through the stand-in's prototype (`toString`, `valueOf`, ...) is not an export it carries.
            if (
                typeof property !== "string" ||
                Object.hasOwn(target, property) ||
                NAMESPACE_PROBES.has(property)
            ) {
                return Reflect.get(target, property, receiver);
            }

            throw new Error(
                `"${packageName}" is routed around its barrel in the test setup to keep the suite's ` +
                    `import time down, and the stand-in does not export "${property}". Add it to the ` +
                    `stand-in, importing it from its own module inside the package rather than from the barrel.`,
            );
        },
    });
}

/**
 * A matcher for suppressConsole
 *
 * @internal
 */
export type Matcher =
    | { type: "regex"; value: RegExp }
    | { type: "includes" | "exact" | "startsWith"; value: string };

/**
 * A type of console to suppress
 *
 * @internal
 */
export type ConsoleType = "error" | "warn" | "log" | "debug" | "info";

/**
 * A specific matcher function
 *
 * @internal
 */
export type SpecificMatcherFunction = (message: string) => boolean;

/**
 * A matcher function
 *
 * @internal
 */
export type MatcherFunction = (
    console: Record<ConsoleType, ConsoleFunction>,
    type: ConsoleType,
    message: string,
) => boolean;

/**
 * A console function, like log, warn or error
 *
 * @internal
 */
export type ConsoleFunction = (...data: any[]) => void;

function suppressConsoleBase<T>(fn: () => T | Promise<T>, matcherFn: MatcherFunction): T | Promise<T> {
    const types: ConsoleType[] = ["error", "warn", "log", "debug", "info"];

    const originals: Record<string, ConsoleFunction> = {};
    let used = false;

    for (const type of types) {
        originals[type] = console[type];
        console[type] = (...data: any[]) => {
            if (!used) used = true;

            const message = data
                .map((part) => {
                    if (typeof part === "object") {
                        try {
                            return JSON.stringify(part);
                        } catch {
                            return "[object with circular reference]";
                        }
                    }
                    return part;
                })
                .join(" ");

            if (matcherFn(originals, type, message)) return;

            originals[type].apply(console, data);
        };
    }

    const result = fn();
    // Check for thenable (Promise-like) instead of instanceof Promise
    // This handles React's act() which returns a thenable, not a native Promise
    // Wrap in Promise.resolve() to ensure .finally() is available
    if (result && typeof (result as Promise<T>).then === "function") {
        return Promise.resolve(result).finally(() => {
            if (!used) originals["log"](`Suppression is redundant at ${new Error().stack}`);

            for (const type of types) {
                // restore the console to previous state
                console[type] = originals[type];
            }
        });
    } else {
        if (!used) originals["log"](`Suppression is redundant at ${new Error().stack}`);

        for (const type of types) {
            // restore the console to previous state
            console[type] = originals[type];
        }
        return result;
    }
}

/**
 * Suppresses certain console outputs
 *
 * @param fn - function which emits console activity
 * @param type - type of console activity to suppress, or an array of types
 * @param matchers - an array of matchers to test console activity against, or a SpecificMatcherFunction
 * @returns T | Promise<T> - return value of fn param
 * @internal
 */
export function suppressConsole<T>(
    fn: () => T | Promise<T>,
    type?: ConsoleType | ConsoleType[],
    matchers?: Matcher[] | SpecificMatcherFunction,
): T | Promise<T>;

/**
 * Suppresses certain console outputs
 *
 * @param fn - function which emits console activity
 * @param matcherFn - a MatcherFunction
 * @returns T | Promise<T> - return value of fn param
 * @internal
 */
export function suppressConsole<T>(fn: () => T | Promise<T>, matcherFn: MatcherFunction): T | Promise<T>;

export function suppressConsole<T>(
    fn: () => T | Promise<T>,
    type: MatcherFunction | ConsoleType | ConsoleType[] = ["error", "warn", "log", "debug", "info"],
    matchers?: Matcher[] | SpecificMatcherFunction,
): T | Promise<T> {
    if (typeof type === "function") return suppressConsoleBase<T>(fn, type); // simple, user handles all

    // this scenario is managed by us slightly more

    // handle the case where they pass a single type
    const typeArray: ConsoleType[] = typeof type === "string" ? [type] : type;

    return suppressConsoleBase<T>(
        fn,
        (console: Record<ConsoleType, ConsoleFunction>, type: ConsoleType, message: string): boolean => {
            if (!typeArray.includes(type)) return false;

            if (typeof matchers === "function") {
                if (matchers(message)) return true;
            } else if (matchers) {
                for (const matcher of matchers) {
                    if (matcher.type === "regex" && matcher.value.test(message)) return true;
                    if (matcher.type === "includes" && message.includes(matcher.value)) return true;
                    if (matcher.type === "exact" && message === matcher.value) return true;
                    if (matcher.type === "startsWith" && message.startsWith(matcher.value)) return true;
                }
            } else {
                // (shown locally, not on CI), devs should use matchers
                console.log(`Wildcard matched (${type}): ${message}`);
                return true;
            }

            console.error(`Passthrough (${type}): ${message}`);

            return false;
        },
    );
}

/**
 * A waitFor-compatible polling function, structurally matching testing-library's waitFor.
 *
 * @internal
 */
export type WaitForFn = <T>(
    callback: () => T | Promise<T>,
    options?: { interval?: number; timeout?: number },
) => Promise<T>;

/**
 * Wraps a testing-library waitFor so it polls every millisecond instead of the default 50ms.
 *
 * @remarks
 * Use in tests where the awaited work settles on the next microtask or a resolved promise -
 * there, every pending assertion would otherwise cost a full default poll interval.
 *
 * @param waitFor - the consumer's waitFor (e.g. from `@testing-library/react`)
 * @param interval - the polling interval in milliseconds, 1 by default
 * @internal
 */
export function createTightWaitFor(
    waitFor: WaitForFn,
    interval: number = 1,
): <T>(callback: () => T | Promise<T>) => Promise<T> {
    return (callback) => waitFor(callback, { interval });
}
