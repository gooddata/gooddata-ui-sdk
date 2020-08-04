// (C) 2007-2020 GoodData Corporation

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
