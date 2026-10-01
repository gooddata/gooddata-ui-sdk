// (C) 2026 GoodData Corporation

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
export interface IGoodmockOptions {
    host: string;
    backendHost: string;
    getMappingPath: (specFile: string) => string;
    workspaceIdMappings?: IWorkspaceIdMapping | IWorkspaceIdMapping[];
    baseUrl?: string;
    /** Secret values replaced by placeholders in saved recordings (see {@link ISecretMapping}). */
    secretMappings?: ISecretMapping[];
    /** Credential-shaped patterns that must never appear in saved recordings (see {@link ILeakPattern}). */
    leakPatterns?: ILeakPattern[];
    /** Consumer-supplied redaction hook for domain-specific secrets (see snapshotAndSaveRecording). */
    sanitizeMappings?: (mappings: IGoodmockMapping[]) => IGoodmockMapping[];
}
