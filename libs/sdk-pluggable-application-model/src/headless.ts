// (C) 2026 GoodData Corporation

import { type IPlatformContext } from "./platformContext.js";

/**
 * How the shell identifies the user to a telemetry provider.
 *
 * @remarks
 * - `hashed`: one-way hashes of the user and the organization that the platform telemetry uses. This is
 *   the default. When the platform telemetry has no hashes for the organization, the shell does not
 *   connect the provider.
 * - `userId`: the user id and the organization id as they are.
 * - `email`: the user email and the organization id as they are. When the user has no email, the shell
 *   does not connect the provider.
 *
 * Set the mode with the `telemetry.identity` key of the headless module registry item. The shell ignores
 * an unknown value and uses `hashed`.
 *
 * @alpha
 */
export type TelemetryIdentityMode = "hashed" | "userId" | "email";

/**
 * Identity that the shell gives to a telemetry provider, resolved by {@link TelemetryIdentityMode}.
 *
 * @alpha
 */
export interface ITelemetryIdentity {
    userId: string;
    organizationId: string;
}

/**
 * Data of one telemetry record that the shell gives to a telemetry provider.
 *
 * @remarks
 * The shell builds this object from an allowlist and does not forward labels or categories. The shell
 * hashes the values of `identifiers` (for example `workspaceId` or `dashboardId`) before it calls the
 * provider. `stats` holds the string, number and boolean context values that the applications send,
 * the same values that the platform telemetry records.
 *
 * @alpha
 */
export interface ITelemetryProviderEventData {
    /**
     * The application that emitted the record: `host-application` or the id of a pluggable application.
     */
    sourceApplication?: string;
    value?: number;
    /**
     * One-way hashes of entity ids, keyed by the neutral entity name.
     */
    identifiers?: Record<string, string>;
    stats?: Record<string, string | number | boolean>;
}

/**
 * Receives the shell's telemetry and forwards it to a third-party tool.
 *
 * @remarks
 * The shell calls the provider for records from the shell and from every pluggable application.
 * It does not forward records from the AI channel. The shell catches every error that a provider
 * throws, so a broken provider cannot stop the other telemetry.
 *
 * The shell calls `identify` once, before the first record. When `identify` returns a promise, the
 * shell waits for it. When `identify` throws or rejects, the shell does not connect the provider.
 *
 * @alpha
 */
export interface ITelemetryProvider {
    identify?(identity: ITelemetryIdentity): void | Promise<void>;
    trackEvent(eventName: string, data: ITelemetryProviderEventData): void;
    trackPageView(page: string, data: ITelemetryProviderEventData): void;
    trackTiming?(variable: string, valueMs: number, data: ITelemetryProviderEventData): void;
    /**
     * The shell calls `dispose` when it unregisters the provider.
     */
    dispose?(): void;
}

/**
 * Options that the shell gives to {@link IHeadlessModule.mount}.
 *
 * @alpha
 */
export interface IHeadlessModuleMountOptions {
    id: string;
    ctx: IPlatformContext;
    /**
     * The `config` of the registry item, or an empty object.
     */
    config: Record<string, unknown>;
    /**
     * Registers a telemetry provider. Returns a function that unregisters it.
     *
     * @remarks
     * The shell replays the records from the page start to a provider that registers soon after the page
     * loads, so the module can register the provider after an asynchronous initialization.
     */
    registerTelemetryProvider(provider: ITelemetryProvider): () => void;
}

/**
 * Handle that a headless module returns from {@link IHeadlessModule.mount}.
 *
 * @alpha
 */
export interface IHeadlessModuleMountHandle {
    /**
     * The shell unregisters the providers of the module before it calls `unmount`.
     */
    unmount(): void;
    /**
     * The shell calls `updateContext` when the platform context changes, for example when the user
     * opens another workspace.
     */
    updateContext?(ctx: IPlatformContext): void;
}

/**
 * Mount function of a headless module.
 *
 * @alpha
 */
export type HeadlessModuleMount = (options: IHeadlessModuleMountOptions) => IHeadlessModuleMountHandle;

/**
 * Module without UI that the shell mounts once per page.
 *
 * @remarks
 * Export the module as `headlessModule` (or as the default export) from the exposed Module Federation
 * module.
 *
 * @alpha
 */
export interface IHeadlessModule {
    mount: HeadlessModuleMount;
    /**
     * Organization IDs allowed to load this module.
     *
     * @remarks
     * The shell enforces the same rules as for {@link IPluggableApp.allowedOrganizations}.
     */
    allowedOrganizations?: string[];
    /**
     * Unix milliseconds timestamp captured at build time.
     *
     * @remarks
     * The shell enforces the same rules as for {@link IPluggableApp.buildTimestamp}.
     */
    buildTimestamp?: number;
}
