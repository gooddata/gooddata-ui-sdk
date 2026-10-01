// (C) 2026 GoodData Corporation

import { mkdirSync, writeFileSync } from "fs";
import { dirname } from "path";

import {
    type IGoodmockMapping,
    type ILeakPattern,
    type ISecretMapping,
    type IWorkspaceIdMapping,
} from "../types.js";

import { assertNoLeakPatterns } from "./assert-no-leak-patterns.js";
import { assertNoSecretLeaks } from "./assert-no-secret-leaks.js";
import { replaceSecrets } from "./replace-secrets.js";
import { sanitizeCredentials } from "./sanitize-credentials.js";
import { sanitizeWorkspaceIds } from "./sanitize-workspace-ids.js";
import { snapshotParams } from "./snapshot-param.js";

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

    sanitizeCredentials(mappings);

    // Consumer-supplied redaction for secrets this module has no knowledge of (e.g. an LLM
    // provider's API key echoed back on a settings entity).
    const sanitizedByCaller = sanitizeMappings ? sanitizeMappings(mappings) : mappings;

    const sanitizedMappings = sanitizeWorkspaceIds(sanitizedByCaller, workspaceIdMappings);

    let output = JSON.stringify({ mappings: sanitizedMappings }, null, 4) + "\n";
    if (backendHost && baseUrl) {
        output = output.replaceAll(backendHost, baseUrl);
    }

    output = replaceSecrets(output, secretMappings);
    assertNoSecretLeaks(output, secretMappings, mappingFilePath);
    assertNoLeakPatterns(output, leakPatterns, mappingFilePath);

    mkdirSync(dirname(mappingFilePath), { recursive: true });
    writeFileSync(mappingFilePath, output);
    // oxlint-disable-next-line eslint-js/no-console
    console.log(`Recording saved to ${mappingFilePath} (${sanitizedMappings.length} mappings)`);
}
