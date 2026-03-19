// (C) 2026 GoodData Corporation

import { mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname } from "path";

/**
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

    // eslint-disable-next-line no-console
    console.log(`Goodmock mappings loaded from ${mappingFilePath} (status: ${response.status})`);
}

/**
 * Reset goodmock scenario state (sequence counters) without clearing mappings.
 * Must be called between tests so scenario-driven stubs start from the
 * beginning for every test — mirrors the Cypress `resetRecordingsScenarios` task.
 */
export async function resetScenarios(host: string): Promise<void> {
    const response = await fetch(`http://${host}/__admin/scenarios/reset`, {
        method: "POST",
    });
    // eslint-disable-next-line no-console
    console.log(`Goodmock scenarios reset (status: ${response.status})`);
}

/**
 * Clear all goodmock stub mappings.
 */
export async function resetMappings(host: string): Promise<void> {
    const response = await fetch(`http://${host}/__admin/reset`, {
        method: "POST",
    });
    // eslint-disable-next-line no-console
    console.log(`Goodmock mappings reset (status: ${response.status})`);
}

/**
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
    // eslint-disable-next-line no-console
    console.log(`Goodmock log requests mocked (status: ${response.status})`);
}

/**
 * Which mode goodmock is running in
 */
export enum GoodmockMode {
    Replay = "replay",
    Record = "record",
    Proxy = "proxy",
}

export function goodmockMode(): GoodmockMode {
    return process.env["GOODMOCK_MODE"] as GoodmockMode;
}

/**
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
    // eslint-disable-next-line no-console
    console.log(`Goodmock recording started, proxying to ${backendHost} (status: ${response.status})`);
}

const snapshotParams = {
    captureHeaders: { "X-GDC-TEST-NAME": {} },
    requestBodyPattern: {
        matcher: "equalToJson",
        ignoreArrayOrder: false,
        ignoreExtraElements: false,
    },
};

export interface IGoodmockMapping {
    request: { url?: string; bodyPatterns?: unknown };
    response: { headers?: Record<string, string>; jsonBody?: Map<string, any> };
}

export interface IWorkspaceIdMapping {
    sourceWorkspaceId: string;
    targetWorkspaceId: string;
}

function sanitizeWorkspaceId(
    mappings: IGoodmockMapping[],
    sourceWorkspaceId: string,
    targetWorkspaceId: string,
): IGoodmockMapping[] {
    if (sourceWorkspaceId === targetWorkspaceId) {
        return mappings;
    }

    const dataString = JSON.stringify({ mappings });
    const sanitizedDataString = dataString.split(sourceWorkspaceId).join(targetWorkspaceId);
    const sanitizedData = JSON.parse(sanitizedDataString) as { mappings: IGoodmockMapping[] };

    // eslint-disable-next-line no-console
    console.log(`Sanitized workspaceId in mappings (${sourceWorkspaceId} -> ${targetWorkspaceId})`);

    return sanitizedData.mappings;
}

/**
 * Snapshot goodmock recordings, save the combined mappings to a JSON file
 * on disk, and sanitize any credentials from the output.
 *
 * This mirrors the Cypress recording flow: two snapshot calls are made —
 * one for executionResults URLs (with repeatsAsScenarios) and one for
 * everything else — then the results are merged and written out.
 *
 * @param host
 * @param mappingFilePath
 * @param workspaceIdMappings - Optional source/target workspace ID rewrite(s)
 * applied before mappings are saved. Accepts a single mapping or an array.
 * @param backendHost - Optional real backend URL (e.g. "https://example.gooddata.com").
 * When provided together with baseUrl, all occurrences are replaced in the
 * saved mappings so that recorded responses (e.g. geo tile URLs) resolve
 * correctly during replay.
 * @param baseUrl - Optional app base URL (e.g. "http://kpi-dashboards-ui:9500")
 * that replaces backendHost references in the saved mappings.
 */
export async function snapshotAndSaveRecording(
    host: string,
    mappingFilePath: string,
    workspaceIdMappings?: IWorkspaceIdMapping | IWorkspaceIdMapping[],
    backendHost?: string,
    baseUrl?: string,
): Promise<void> {
    // Snapshot executionResults with scenarios
    const scenariosRes = await fetch(`http://${host}/__admin/recordings/snapshot`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            repeatsAsScenarios: true,
            filters: { urlPattern: ".*executionResults.*" },
            persist: false,
            ...snapshotParams,
        }),
    });
    const scenariosData = (await scenariosRes.json()) as { mappings: IGoodmockMapping[] };

    // Snapshot everything else without scenarios
    const plainRes = await fetch(`http://${host}/__admin/recordings/snapshot`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            repeatsAsScenarios: false,
            filters: { urlPattern: "((?!executionResults).)*" },
            persist: false,
            ...snapshotParams,
        }),
    });
    const plainData = (await plainRes.json()) as { mappings: IGoodmockMapping[] };

    const mappings = [...plainData.mappings, ...scenariosData.mappings];

    // Sanitize credentials
    for (const mapping of mappings) {
        if (mapping?.request?.url === "/gdc/account/login") {
            delete mapping.request.bodyPatterns;
            if (mapping.response.headers) {
                delete mapping.response.headers["Set-Cookie"];
            }
        }

        const requestUrl = mapping?.request?.url;
        if (
            typeof requestUrl === "string" &&
            /^\/api\/v1\/actions\/workspaces\/[^/]+\/resolveSettings$/.test(requestUrl)
        ) {
            try {
                const parsedBody = mapping?.response?.jsonBody;
                if (Array.isArray(parsedBody)) {
                    for (const setting of parsedBody) {
                        if (
                            (setting?.id === "agGridToken" || setting?.id === "mapboxToken") &&
                            setting?.content &&
                            typeof setting.content === "object"
                        ) {
                            setting.content.value = "";
                        }
                    }
                    mapping.response.jsonBody = parsedBody;
                }
            } catch {
                console.warn(
                    `sanitizeCredentials – resolveSettings body is not valid JSON for url: ${requestUrl}`,
                );
            }
        }
    }

    const mappingsToApply = Array.isArray(workspaceIdMappings)
        ? workspaceIdMappings
        : workspaceIdMappings
          ? [workspaceIdMappings]
          : [];
    const sanitizedMappings = mappingsToApply.reduce(
        (acc, { sourceWorkspaceId, targetWorkspaceId }) =>
            sanitizeWorkspaceId(acc, sourceWorkspaceId, targetWorkspaceId),
        mappings,
    );

    let output = JSON.stringify({ mappings: sanitizedMappings }, null, 4) + "\n";
    if (backendHost && baseUrl) {
        output = output.replaceAll(backendHost, baseUrl);
    }

    mkdirSync(dirname(mappingFilePath), { recursive: true });
    writeFileSync(mappingFilePath, output);
    // eslint-disable-next-line no-console
    console.log(`Recording saved to ${mappingFilePath} (${sanitizedMappings.length} mappings)`);
}
