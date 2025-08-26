// (C) 2007-2025 GoodData Corporation
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
    if (result instanceof Promise) {
        return result.finally(() => {
            if (!used) originals.log(`Suppression is redundant at ${new Error().stack}`);

            for (const type of types) {
                // restore the console to previous state
                console[type] = originals[type];
            }
        });
    } else {
        if (!used) originals.log(`Suppression is redundant at ${new Error().stack}`);

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
