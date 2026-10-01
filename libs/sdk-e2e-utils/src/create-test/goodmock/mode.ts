// (C) 2026 GoodData Corporation

/**
 * @internal
 * Which mode goodmock is running in
 */
export enum GoodmockMode {
    Replay = "replay",
    Record = "record",
    Proxy = "proxy",
}

/**
 * @internal
 */
export function goodmockMode(): GoodmockMode {
    return process.env["GOODMOCK_MODE"] as GoodmockMode;
}
