// (C) 2026 GoodData Corporation

import { readFileSync } from "fs";

/**
 * @internal
 * Load goodmock stub mappings from a JSON file on disk.
 *
 * @param host - Goodmock host:port (e.g. "backend-mock:8080")
 * @param mappingFilePath - Absolute path to the mapping JSON file
 */
export async function loadMappings(host: string, mappingFilePath: string): Promise<void> {
    let mappings: string;
    try {
        mappings = readFileSync(mappingFilePath, "utf-8");
    } catch {
        console.warn(`No mapping file found: ${mappingFilePath}, skipping`);
        return;
    }

    let json: unknown;
    try {
        json = JSON.parse(mappings);
    } catch {
        console.error(`Failed to parse mapping file: ${mappingFilePath}`);
        return;
    }

    const response = await fetch(`http://${host}/__admin/mappings/import`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(json),
    });

    // oxlint-disable-next-line eslint-js/no-console
    console.log(`Goodmock mappings loaded from ${mappingFilePath} (status: ${response.status})`);
}

/**
 * @internal
 * Reset goodmock scenario state (sequence counters) without clearing mappings.
 * Must be called between tests so scenario-driven stubs start from the
 * beginning for every test — mirrors the Cypress `resetRecordingsScenarios` task.
 */
export async function resetScenarios(host: string): Promise<void> {
    const response = await fetch(`http://${host}/__admin/scenarios/reset`, {
        method: "POST",
    });
    // oxlint-disable-next-line eslint-js/no-console
    console.log(`Goodmock scenarios reset (status: ${response.status})`);
}

/**
 * @internal
 * Clear all goodmock stub mappings.
 */
export async function resetMappings(host: string): Promise<void> {
    const response = await fetch(`http://${host}/__admin/reset`, {
        method: "POST",
    });
    // oxlint-disable-next-line eslint-js/no-console
    console.log(`Goodmock mappings reset (status: ${response.status})`);
}

/**
 * @internal
 * Add a goodmock stub that mocks log requests (POST /gdc/app/projects/.../log).
 * This prevents the app from failing when it tries to send logs.
 */
export async function mockLogRequests(host: string): Promise<void> {
    const response = await fetch(`http://${host}/__admin/mappings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            request: {
                method: "POST",
                urlPattern: "/gdc/app/projects/.*/log",
            },
            response: {
                body: "",
                status: 200,
            },
        }),
    });
    // oxlint-disable-next-line eslint-js/no-console
    console.log(`Goodmock log requests mocked (status: ${response.status})`);
}

/**
 * @internal
 * Add a catch-all proxy mapping so goodmock forwards every request to the
 * real backend and records the interactions.  Must be called after
 * {@link resetMappings} in recording mode.
 */
export async function startRecording(host: string, backendHost: string): Promise<void> {
    const response = await fetch(`http://${host}/__admin/mappings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            request: { method: "ANY", urlPattern: ".*" },
            response: { proxyBaseUrl: backendHost },
        }),
    });
    // oxlint-disable-next-line eslint-js/no-console
    console.log(`Goodmock recording started, proxying to ${backendHost} (status: ${response.status})`);
}
