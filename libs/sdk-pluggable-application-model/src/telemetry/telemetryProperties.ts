// (C) 2026 GoodData Corporation

/**
 * Scope of a telemetry property slot — `"visit"` persists for the whole session, `"page"` is per action.
 *
 * @alpha
 */
export type TelemetryPropertyScope = "visit" | "page";

/**
 * A single telemetry property slot: its 1-based index, the name reported under that index, and scope.
 *
 * @remarks
 * The analytics backend the shell uses aggregates these by `(scope, index)`, so the index — not the name —
 * is the stable contract.
 *
 * @alpha
 */
export interface ITelemetryPropertySlot {
    index: number;
    name: string;
    scope: TelemetryPropertyScope;
}

/**
 * Canonical, single-source-of-truth allocation of the shell's telemetry property slots, so a given
 * `(scope, index)` means the same thing everywhere it is reported.
 *
 * @remarks
 * The shell's analytics backend aggregates properties by `(scope, index)`, not by the name passed at call
 * time — so the index is the contract, and slots must be sourced from here rather than assigned by array
 * position.
 *
 * This registry is **shell-owned**: only the host shell consumes it when serializing telemetry. Pluggable
 * modules never reference it — they forward transport-neutral telemetry (see the `identifiers` / `stats`
 * groups on {@link IPluggableAppTelemetryEventData}) and the host alone maps that onto the packed page
 * slots below. (The legacy standalone trackers still read it directly until standalone mode is removed.)
 *
 * Page slots:
 * - `Multivalue` (1) — packed `key1=v1,…` of the event's sensitive identifiers (the shell hashes them).
 * - `StatsValue` (2) — packed `key1=v1,…` of the event's contextual stats/metrics (verbatim).
 * - `ModuleReactVersion` / `ModuleSdkVersion` (3/4) — the emitting module's runtime versions.
 *
 * Both packed values are bounded to ~200 chars by the backend. Module React / SDK versions use `"page"`
 * scope (not `"visit"`): the active pluggable module can change within a session as the user navigates
 * between apps, so the version is an action-level attribute that must ride only the event it describes.
 * (The host's own React / SDK versions are constant per session, so they stay in `"visit"` scope at 6/7.)
 *
 * @alpha
 */
export const TELEMETRY_PROPERTIES = {
    deploymentId: { index: 1, name: "DeploymentId", scope: "visit" },
    organizationId: { index: 2, name: "OrganizationId", scope: "visit" },
    sessionId: { index: 3, name: "SessionId", scope: "visit" },
    revHash: { index: 4, name: "RevHash", scope: "visit" },
    isExport: { index: 5, name: "isExport", scope: "visit" },
    hostReactVersion: { index: 6, name: "HostReactVersion", scope: "visit" },
    hostSdkVersion: { index: 7, name: "HostSdkVersion", scope: "visit" },
    multivalue: { index: 1, name: "Multivalue", scope: "page" },
    statsValue: { index: 2, name: "StatsValue", scope: "page" },
    moduleReactVersion: { index: 3, name: "ModuleReactVersion", scope: "page" },
    moduleSdkVersion: { index: 4, name: "ModuleSdkVersion", scope: "page" },
} as const satisfies Record<string, ITelemetryPropertySlot>;
