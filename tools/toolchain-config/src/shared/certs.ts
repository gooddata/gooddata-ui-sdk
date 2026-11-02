// (C) 2026 GoodData Corporation

import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * TLS material for a local https dev server.
 */
export interface IDevCerts {
    ca: Buffer;
    key: Buffer;
    cert: Buffer;
}

/**
 * Where the local development certificates live.
 */
export function gooddataCertsDir(): string {
    return join(process.env["HOME"] || process.env["USERPROFILE"] || "", ".gooddata", "certs");
}

/**
 * The local development certificates, or undefined (with a console note) when they are not
 * installed, in which case dev servers fall back to plain http.
 */
export function loadGooddataDevCerts(): IDevCerts | undefined {
    const certDir = gooddataCertsDir();

    try {
        return {
            ca: readFileSync(join(certDir, "rootCA.pem")),
            key: readFileSync(join(certDir, "localhost-key.pem")),
            cert: readFileSync(join(certDir, "localhost-cert.pem")),
        };
    } catch {
        // oxlint-disable-next-line eslint-js/no-console
        console.info(`No certificates found in ${certDir}, skipping HTTPS configuration`);
        return undefined;
    }
}
