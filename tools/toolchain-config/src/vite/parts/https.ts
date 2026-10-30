// (C) 2026 GoodData Corporation

import { type ServerOptions } from "vite";

import { loadGooddataDevCerts } from "../../shared/certs.js";

/**
 * `server.https` / `preview.https` from the local GoodData development certificates, or undefined
 * (plain http) when they are not installed.
 */
export function devServerHttps(): ServerOptions["https"] {
    return loadGooddataDevCerts();
}
