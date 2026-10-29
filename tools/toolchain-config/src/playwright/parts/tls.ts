// (C) 2026 GoodData Corporation

/**
 * Makes Node accept self-signed certificates for the whole test process, so requests the tests make
 * outside the browser (fixtures, API helpers, the web server readiness probe) reach the self-signed
 * e2e hosts. The browser side is covered by `ignoreHTTPSErrors`.
 *
 * This is a process-wide side effect and belongs at config load time, before Playwright starts.
 */
export function allowSelfSignedTls(): void {
    process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";
}
