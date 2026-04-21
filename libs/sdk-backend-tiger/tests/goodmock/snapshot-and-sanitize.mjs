#!/usr/bin/env node
// (C) 2026 GoodData Corporation

import { writeFileSync } from "fs";

const [, , goodmockHost, outputPath] = process.argv;

if (!goodmockHost || !outputPath) {
    console.error("Usage: snapshot-and-sanitize.mjs <goodmockHost> <outputPath>");
    process.exit(1);
}

const snapshotParams = {
    persist: false,
    repeatsAsScenarios: false,
    captureHeaders: {
        Accept: {},
        "Content-Type": { caseInsensitive: true },
    },
    requestBodyPattern: {
        matcher: "equalToJson",
        ignoreArrayOrder: false,
        ignoreExtraElements: false,
    },
    extractBodyCriteria: {
        textSizeThreshold: "2048",
        binarySizeThreshold: "10240",
    },
    outputFormat: "FULL",
};

const res = await fetch(`${goodmockHost}/__admin/recordings/snapshot`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(snapshotParams),
});

if (!res.ok) {
    console.error(`Snapshot failed: ${res.status} ${res.statusText}`);
    process.exit(1);
}

const { mappings = [] } = await res.json();

// Drop auth-related recordings and sanitize user profile data
const sanitized = mappings.filter((m) => {
    const url = m?.request?.url ?? m?.request?.urlPattern ?? "";
    return !/login|token/i.test(url);
});

function sanitizeProfile(body) {
    if (!body || typeof body !== "object") return body;
    if (body.userId) body.userId = "first.last";
    if (body.links?.user) {
        body.links.user =
            "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/users/first.last";
    }
    return body;
}

for (const mapping of sanitized) {
    const url = mapping?.request?.url ?? "";
    if (!url.startsWith("/api/v1/profile")) continue;

    const response = mapping?.response;
    if (!response) continue;

    if (response.jsonBody && typeof response.jsonBody === "object") {
        response.jsonBody = sanitizeProfile(response.jsonBody);
    } else if (typeof response.body === "string") {
        try {
            const parsed = JSON.parse(response.body);
            response.body = JSON.stringify(sanitizeProfile(parsed));
        } catch {
            // leave response body as-is
        }
    }
}

writeFileSync(outputPath, JSON.stringify({ mappings: sanitized }, null, 4) + "\n");
// eslint-disable-next-line no-console
console.log(`Wrote ${sanitized.length} mappings to ${outputPath}`);
