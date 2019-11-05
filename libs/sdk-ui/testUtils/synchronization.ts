// (C) 2019 GoodData Corporation

/**
 * Waits for any async methods resolution.
 * This is useful when we need to wait for some component's inner Promise to resolve
 */
export const waitForAsync = () => new Promise((resolve: (...args: any[]) => void) => setImmediate(resolve));
