// (C) 2026 GoodData Corporation

import { mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname } from "path";

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

    // eslint-disable-next-line no-console
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
    // eslint-disable-next-line no-console
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
    // eslint-disable-next-line no-console
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
    // eslint-disable-next-line no-console
    console.log(`Goodmock log requests mocked (status: ${response.status})`);
}

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

/**
 * @internal
 */
export interface IGoodmockMapping {
    request: { url?: string; urlPath?: string; bodyPatterns?: unknown };
    response: { headers?: Record<string, string>; jsonBody?: unknown; body?: string };
}

/**
 * @internal
 */
export interface IWorkspaceIdMapping {
    sourceWorkspaceId: string;
    targetWorkspaceId: string;
}

/**
 * @internal
 * Rewrite of a secret value in saved recordings. Every occurrence of `secret` (request bodies,
 * response bodies, URLs) is replaced with `placeholder`, so tests can type the placeholder at
 * replay time and still match the recorded request exactly.
 */
export interface ISecretMapping {
    secret: string;
    placeholder: string;
}

/**
 * @internal
 * A credential shape that must never appear in a saved recording (checked against the fully
 * serialized output). Provide domain-specific shapes (e.g. a provider's API key format) via
 * {@link ISnapshotAndSaveRecordingOptions.leakPatterns} — this module has no built-in patterns of
 * its own, since it has no knowledge of what a given consumer's traffic considers a secret.
 */
export interface ILeakPattern {
    label: string;
    pattern: RegExp;
}

/**
 * @internal
 */
export interface ISnapshotAndSaveRecordingOptions {
    /** Source/target workspace ID rewrite(s) applied before mappings are saved. */
    workspaceIdMappings?: IWorkspaceIdMapping | IWorkspaceIdMapping[];
    /**
     * Real backend URL (e.g. "https://example.gooddata.com"). When provided together with
     * baseUrl, all occurrences are replaced in the saved mappings so that recorded responses
     * (e.g. geo tile URLs) resolve correctly during replay.
     */
    backendHost?: string;
    /** App base URL (e.g. "http://kpi-dashboards-ui:9500") that replaces backendHost references. */
    baseUrl?: string;
    /**
     * Secret rewrites. Each secret value is replaced by its placeholder everywhere in the saved
     * mappings (request bodyPatterns included, and masked variants such as "sk-prox***abcd").
     * Saving fails hard if any secret still remains afterwards.
     */
    secretMappings?: ISecretMapping[];
    /**
     * Credential-shaped patterns that must never appear anywhere in the saved output, regardless
     * of which field they came from. A backstop for secrets `secretMappings` doesn't know about
     * (e.g. a value a backend echoed back that the test never typed). Saving fails hard on a match.
     */
    leakPatterns?: ILeakPattern[];
    /**
     * Consumer-supplied hook to redact domain-specific secrets from the collected mappings (e.g.
     * blank a `content.apiKey` field on a settings entity) before they're merged and written out.
     * Runs once, right after the built-in credential handling (login cookie, resolveSettings map
     * tokens) and before workspace-id rewriting.
     */
    sanitizeMappings?: (mappings: IGoodmockMapping[]) => IGoodmockMapping[];
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
 * @internal
 * Snapshot goodmock recordings, save the combined mappings to a JSON file
 * on disk, and sanitize any credentials from the output.
 *
 * A single snapshot is taken with repeatsAsScenarios enabled: goodmock turns a
 * request into a scenario chain only when its responses differ across the
 * recording, so stateful sequences are preserved and everything else stays flat.
 *
 * @param host - Goodmock host:port (e.g. "backend-mock:8080")
 * @param mappingFilePath - Absolute path to write the mapping JSON file to
 * @param options - See {@link ISnapshotAndSaveRecordingOptions}.
 */
export async function snapshotAndSaveRecording(
    host: string,
    mappingFilePath: string,
    options: ISnapshotAndSaveRecordingOptions = {},
): Promise<void> {
    const { workspaceIdMappings, backendHost, baseUrl, secretMappings, leakPatterns, sanitizeMappings } =
        options;
    // Snapshot everything with scenarios enabled. goodmock only emits a scenario
    // chain when a given request produced *different* responses across the
    // recording; identical repeats collapse to a single mapping. This captures
    // stateful sequences (e.g. a GET whose result changes after a POST) that the
    // old per-URL dedup path silently dropped, while keeping idempotent traffic flat.
    const snapshotRes = await fetch(`http://${host}/__admin/recordings/snapshot`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            repeatsAsScenarios: true,
            persist: false,
            ...snapshotParams,
        }),
    });
    const snapshotData = (await snapshotRes.json()) as { mappings: IGoodmockMapping[] };

    const mappings = [...snapshotData.mappings];

    // An empty snapshot means the recording journal was lost (e.g. a worker crash re-ran the
    // beforeAll reset mid-spec) or the spec made no requests at all. Never overwrite a previous
    // recording with an empty one, and fail the run so the broken recording cannot go unnoticed.
    if (mappings.length === 0) {
        throw new Error(
            `Recording snapshot for ${mappingFilePath} is empty — keeping the existing mapping ` +
                `file. Investigate (worker crash mid-spec? goodmock proxy misconfigured?) and re-record.`,
        );
    }

    // Sanitize credentials
    for (const mapping of mappings) {
        if (mapping?.request?.url === "/gdc/account/login") {
            delete mapping.request.bodyPatterns;
            if (mapping.response.headers) {
                delete mapping.response.headers["Set-Cookie"];
            }
        }

        // Sanitize secrets from resolveSettings responses. Match both org-level
        // (/api/v1/actions/resolveSettings) and workspace-level variants, via either `url`
        // (no query) or `urlPath` (with query params).
        const requestPath = mapping?.request?.url ?? mapping?.request?.urlPath;
        if (typeof requestPath === "string" && requestPath.includes("/resolveSettings")) {
            try {
                type SettingItem = { id?: string; content?: Record<string, unknown> };
                const body = mapping?.response?.jsonBody;
                const settings: SettingItem[] | null = Array.isArray(body)
                    ? (body as SettingItem[])
                    : Array.isArray((body as { data?: unknown })?.data)
                      ? (body as { data: SettingItem[] }).data
                      : null;
                if (settings) {
                    for (const setting of settings) {
                        const content = setting?.content;
                        if (!content || typeof content !== "object") {
                            continue;
                        }
                        // Map tokens (agGrid, mapbox) are stored under content.value.
                        if (setting?.id === "agGridToken" || setting?.id === "mapboxToken") {
                            content["value"] = "";
                        }
                    }
                }
            } catch {
                console.warn(
                    `sanitizeCredentials – resolveSettings body is not valid JSON for: ${requestPath}`,
                );
            }
        }
    }

    // Consumer-supplied redaction for secrets this module has no knowledge of (e.g. an LLM
    // provider's API key echoed back on a settings entity).
    const sanitizedByCaller = sanitizeMappings ? sanitizeMappings(mappings) : mappings;

    const mappingsToApply = Array.isArray(workspaceIdMappings)
        ? workspaceIdMappings
        : workspaceIdMappings
          ? [workspaceIdMappings]
          : [];
    const sanitizedMappings = mappingsToApply.reduce(
        (acc, { sourceWorkspaceId, targetWorkspaceId }) =>
            sanitizeWorkspaceId(acc, sourceWorkspaceId, targetWorkspaceId),
        sanitizedByCaller,
    );

    let output = JSON.stringify({ mappings: sanitizedMappings }, null, 4) + "\n";
    if (backendHost && baseUrl) {
        output = output.replaceAll(backendHost, baseUrl);
    }

    // Replace secrets typed into the UI / sent by API helpers during recording with their
    // replay-time placeholders. JSON-escape both sides so values containing characters that
    // JSON.stringify escapes (quotes, backslashes) are still found in the serialized output.
    // Provider error messages echo keys in a masked form ("sk-prox***********abcd"), so that
    // shape is rewritten too — it still leaks the ends of a real key.
    const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    // Below this, prefix/suffix would overlap or leave nothing to mask — there's no safe
    // "partial reveal" shape to detect, so such secrets rely on the exact-match replace above.
    const MIN_MASKABLE_SECRET_LENGTH = 6;
    // Masking keeps a variable-length prefix/suffix of the key around the asterisks; scale how
    // much we match by the secret's own length instead of assuming a fixed provider convention
    // (e.g. OpenAI's "sk-prox***********abcd") so shorter secrets and other providers' masking
    // shapes are still caught.
    const buildMaskedFormPattern = (escapedSecret: string): RegExp | undefined => {
        if (escapedSecret.length < MIN_MASKABLE_SECRET_LENGTH) {
            return undefined;
        }
        const prefixLength = Math.min(7, Math.floor(escapedSecret.length / 3));
        const suffixLength = Math.min(4, Math.floor(escapedSecret.length / 4));
        return new RegExp(
            `${escapeRegex(escapedSecret.slice(0, prefixLength))}[^"*\\\\]*[*]+[^"*\\\\]*${escapeRegex(escapedSecret.slice(-suffixLength))}`,
            "g",
        );
    };
    const effectiveSecretMappings = (secretMappings ?? []).filter(
        ({ secret, placeholder }) => secret && secret !== placeholder,
    );
    for (const { secret, placeholder } of effectiveSecretMappings) {
        const escapedSecret = JSON.stringify(secret).slice(1, -1);
        const escapedPlaceholder = JSON.stringify(placeholder).slice(1, -1);
        output = output.replaceAll(escapedSecret, escapedPlaceholder);
        const maskedForm = buildMaskedFormPattern(escapedSecret);
        if (maskedForm) {
            output = output.replace(maskedForm, escapedPlaceholder);
        }
    }
    // Leak guard: never write a recording that still contains a real secret (full or masked).
    for (const { secret } of effectiveSecretMappings) {
        const escapedSecret = JSON.stringify(secret).slice(1, -1);
        const maskedForm = buildMaskedFormPattern(escapedSecret);
        if (output.includes(escapedSecret) || output.includes(secret) || maskedForm?.test(output)) {
            throw new Error(
                `Recording for ${mappingFilePath} still contains a secret after sanitization ` +
                    `(e.g. in an encoded form). Refusing to save the mapping file.`,
            );
        }
    }
    // Pattern guard: catch credential-shaped values from ANY source (not just the ones the
    // tests typed), e.g. a real key stored in a backend org setting under an unexpected field.
    // Patterns are consumer-supplied — this module has no built-in notion of what a secret
    // looks like for a given domain (see ISnapshotAndSaveRecordingOptions.leakPatterns).
    for (const { label, pattern } of leakPatterns ?? []) {
        // Reset lastIndex in case pattern carries the g/y flag — exec() on a stateful regex
        // would otherwise resume from wherever a previous call (e.g. a prior recording) left off.
        pattern.lastIndex = 0;
        const match = pattern.exec(output);
        if (match) {
            throw new Error(
                `Recording for ${mappingFilePath} contains a value shaped like a ${label} ` +
                    `("${match[0].slice(0, 8)}…"). Refusing to save the mapping file — extend ` +
                    `sanitizeMappings / secretMappings so it gets sanitized.`,
            );
        }
    }

    mkdirSync(dirname(mappingFilePath), { recursive: true });
    writeFileSync(mappingFilePath, output);
    // eslint-disable-next-line no-console
    console.log(`Recording saved to ${mappingFilePath} (${sanitizedMappings.length} mappings)`);
}
