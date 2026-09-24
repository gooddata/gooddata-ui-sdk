// (C) 2026 GoodData Corporation

import { useMemo } from "react";

import {
    type ApplicationScope,
    type IPluggableApplicationOrganizationPermissions,
    type LocalPluggableApplicationsRegistry,
    type PluggableApplicationRegistryItem,
    type RemotePluggableApplicationsRegistry,
    evaluateCondition,
    toPluggableApplicationWorkspacePermissions,
} from "@gooddata/sdk-model";
import {
    type IOrganizationPermissions,
    type IPlatformContext,
} from "@gooddata/sdk-pluggable-application-model";

const SUPPORTED_API_VERSION = "1.0";

let registeredLocalApplications: LocalPluggableApplicationsRegistry | undefined;

/**
 * Registers the local pluggable applications manifest. Called by the host or harness
 * before rendering.
 *
 * @alpha
 */
export function registerLocalApplications(registry: LocalPluggableApplicationsRegistry): void {
    registeredLocalApplications = registry;
}

/**
 * @internal - exported for testing
 */
export function getRemoteRegistry(ctx: IPlatformContext): RemotePluggableApplicationsRegistry | undefined {
    const raw = ctx.userSettings.registeredPluggableApplications;
    if (raw?.apiVersion === undefined) {
        return undefined;
    }
    if (raw.apiVersion !== SUPPORTED_API_VERSION) {
        console.error(
            `[host-runtime/registry] Remote registry apiVersion "${raw.apiVersion}" is not supported. ` +
                `Expected "${SUPPORTED_API_VERSION}". Remote registry will be ignored.`,
        );
        return undefined;
    }
    return raw;
}

function getLocalApplications(): PluggableApplicationRegistryItem[] {
    if (!registeredLocalApplications) {
        return [];
    }
    if (registeredLocalApplications.apiVersion !== SUPPORTED_API_VERSION) {
        console.error(
            `[host-runtime/registry] Local registry apiVersion "${registeredLocalApplications.apiVersion}" ` +
                `is not supported. Expected "${SUPPORTED_API_VERSION}". Local registry will be ignored.`,
        );
        return [];
    }
    return registeredLocalApplications.applications;
}

function mergeApplications(
    localApps: PluggableApplicationRegistryItem[],
    remoteApps: PluggableApplicationRegistryItem[],
): PluggableApplicationRegistryItem[] {
    const seenIds = new Set<string>();
    const merged: PluggableApplicationRegistryItem[] = [];

    for (const app of localApps) {
        if (seenIds.has(app.id)) {
            console.error(
                `[host-runtime/registry] Duplicate application ID "${app.id}" in local registry, skipping.`,
            );
            continue;
        }
        seenIds.add(app.id);
        merged.push(app);
    }

    for (const app of remoteApps) {
        if (seenIds.has(app.id)) {
            console.error(
                `[host-runtime/registry] Duplicate application ID "${app.id}" from remote registry, ` +
                    `local application takes precedence.`,
            );
            continue;
        }
        seenIds.add(app.id);
        merged.push(app);
    }

    return merged;
}

function applyOverrides(
    apps: PluggableApplicationRegistryItem[],
    overrides: RemotePluggableApplicationsRegistry["overrides"] | undefined,
): PluggableApplicationRegistryItem[] {
    if (!overrides || Object.keys(overrides).length === 0) {
        return apps;
    }
    return apps.map((app) => {
        const override = overrides[app.id];
        if (!override) {
            return app;
        }
        return { ...app, ...override };
    });
}

function sortByMenuOrder(apps: PluggableApplicationRegistryItem[]): PluggableApplicationRegistryItem[] {
    return [...apps].sort((a, b) => a.menuOrder - b.menuOrder);
}

function filterByAllowedList(
    apps: PluggableApplicationRegistryItem[],
    allowedIds: string[] | undefined,
): PluggableApplicationRegistryItem[] {
    if (allowedIds === undefined) {
        return apps;
    }
    const allowedSet = new Set(allowedIds);
    return apps.filter((app) => allowedSet.has(app.id));
}

function filterDisabled(apps: PluggableApplicationRegistryItem[]): PluggableApplicationRegistryItem[] {
    // isEnabled is optional but "true" is the default value
    return apps.filter((app) => app.isEnabled === undefined || app.isEnabled);
}

function entitlementsToRecord(
    entitlements: IPlatformContext["entitlements"],
): Record<string, string | boolean> {
    return Object.fromEntries(
        (entitlements ?? []).map((e) => [e.name, e.value === undefined ? true : e.value]),
    );
}

function toPluggableApplicationOrganizationPermissions(
    permissions: IOrganizationPermissions,
): IPluggableApplicationOrganizationPermissions {
    return {
        canManageOrganization: permissions.canManageOrganization ?? false,
        canCreateDevToken: permissions.canCreateDevToken ?? false,
        hasBaseUiAccess: permissions.hasBaseUiAccess ?? false,
    };
}

// Forces the two shell flags on. A flag source that cannot be reached resolves them false, which
// leaves only the legacy external twin eligible; route matching skips external apps, so an embedded
// or export URL would then match nothing.
function settingsForRequirements(ctx: IPlatformContext): IPlatformContext["settings"] {
    if (ctx.embeddingMode !== "iframe" && ctx.isExportMode !== true) {
        return ctx.settings;
    }
    return {
        ...ctx.settings,
        enableShellApplication_dashboards: true,
        enableShellApplication_analyticalDesigner: true,
    };
}

function appMeetsRequirements(
    {
        requiredSettings,
        requiredWorkspacePermissions,
        requiredOrganizationPermissions,
        requiredEntitlements,
    }: PluggableApplicationRegistryItem,
    ctx: IPlatformContext,
    skipWorkspacePermissions: boolean,
    skipSettings: boolean,
): boolean {
    if (
        requiredSettings !== undefined &&
        !skipSettings &&
        !evaluateCondition(requiredSettings, settingsForRequirements(ctx))
    ) {
        return false;
    }
    if (requiredWorkspacePermissions !== undefined && !skipWorkspacePermissions) {
        const wsPerms = ctx.workspacePermissions
            ? toPluggableApplicationWorkspacePermissions(ctx.workspacePermissions)
            : undefined;
        if (!evaluateCondition(requiredWorkspacePermissions, wsPerms)) {
            return false;
        }
    }
    if (
        requiredOrganizationPermissions !== undefined &&
        !evaluateCondition(
            requiredOrganizationPermissions,
            toPluggableApplicationOrganizationPermissions(ctx.organizationPermissions ?? {}),
        )
    ) {
        return false;
    }
    if (requiredEntitlements !== undefined) {
        const entitlementMap = entitlementsToRecord(ctx.entitlements);
        if (!evaluateCondition(requiredEntitlements, entitlementMap)) {
            return false;
        }
    }
    return true;
}

function filterByRequirements(
    apps: PluggableApplicationRegistryItem[],
    ctx: IPlatformContext,
    skipWorkspacePermissions: boolean,
    skipSettings: boolean,
): PluggableApplicationRegistryItem[] {
    return apps.filter((app) => appMeetsRequirements(app, ctx, skipWorkspacePermissions, skipSettings));
}

function filterByScope(
    apps: PluggableApplicationRegistryItem[],
    scope: ApplicationScope | undefined,
): PluggableApplicationRegistryItem[] {
    if (scope === undefined) {
        return [];
    }
    return apps.filter((app) => app.applicationScope === scope);
}

/**
 * Drops the standard (local) applications when `restrictBaseUi` is set and the user lacks the
 * BASE_UI_ACCESS organization permission.
 *
 * BASE_UI_ACCESS is a platform-wide organization permission that gates visibility of all
 * standard (local) applications. Remote applications are not subject to this check because
 * they are registered explicitly by the tenant and are expected to manage their own access.
 */
function filterLocalByBaseUiAccess(
    localApps: PluggableApplicationRegistryItem[],
    ctx: IPlatformContext,
): PluggableApplicationRegistryItem[] {
    if (!ctx.userSettings.restrictBaseUi) {
        return localApps;
    }
    return ctx.organizationPermissions?.hasBaseUiAccess ? localApps : [];
}

interface IResolveApplicationsOptions {
    /**
     * Local (standard) pluggable applications
     */
    localApps: PluggableApplicationRegistryItem[];
    /**
     * Remote registry configuration from user settings, may be undefined
     */
    remoteRegistry: RemotePluggableApplicationsRegistry | undefined;
    /**
     * Platform context containing user settings, permissions, entitlements, etc.
     */
    ctx: IPlatformContext;
    /**
     * Application scope to filter by; if undefined, no apps are returned
     */
    scope: ApplicationScope | undefined;
    /**
     * Leaves `requiredWorkspacePermissions` unevaluated, for callers that decide per workspace
     * rather than for the workspace in `ctx`.
     */
    skipWorkspacePermissions?: boolean;
    /**
     * Leaves `requiredSettings` unevaluated, for callers that decide against another workspace's
     * settings rather than those of the active scope.
     */
    skipSettings?: boolean;
}

/**
 * Resolves the final list of pluggable applications from the local and remote registries.
 *
 * Processing steps (in order):
 * 1. Filter local apps by allowedStandardApplications list (if provided in remote registry)
 * 2. Filter local apps by BASE_UI_ACCESS organization permission (if restrictBaseUi is set)
 * 3. Merge local and remote applications - local apps are added first, duplicates (by ID) are skipped with console.error
 * 4. Apply overrides from the remote registry to the merged list
 * 5. Filter out disabled applications (isEnabled: false)
 * 6. Filter by application scope - keep only apps whose applicationScope matches scope; if scope is undefined, no apps pass through
 * 7. Filter by requirements - check requiredSettings, requiredWorkspacePermissions, requiredOrganizationPermissions, and requiredEntitlements (embedded and export modes force the shell application flags on; `skipWorkspacePermissions` leaves requiredWorkspacePermissions to the caller)
 * 8. Sort by menuOrder (ascending)
 *
 * @param options - Resolution options; see {@link IResolveApplicationsOptions}
 * @returns Filtered and sorted list of pluggable applications ready for display
 *
 * @internal - exported for testing
 */
export function resolveApplications({
    localApps,
    remoteRegistry,
    ctx,
    scope,
    skipWorkspacePermissions = false,
    skipSettings = false,
}: IResolveApplicationsOptions): PluggableApplicationRegistryItem[] {
    const { applications: remoteApps, overrides, allowedStandardApplications } = remoteRegistry ?? {};
    const filteredLocal = filterLocalByBaseUiAccess(
        filterByAllowedList(localApps, allowedStandardApplications),
        ctx,
    );
    return sortByMenuOrder(
        filterByRequirements(
            filterByScope(
                filterDisabled(applyOverrides(mergeApplications(filteredLocal, remoteApps ?? []), overrides)),
                scope,
            ),
            ctx,
            skipWorkspacePermissions,
            skipSettings,
        ),
    );
}

/**
 * Resolves the workspace-scoped applications published to pluggable applications through
 * {@link @gooddata/sdk-pluggable-application-model#IPlatformContextV1.availableApplications}.
 *
 * @remarks
 * Applies every requirement that holds organization-wide and leaves the two that a single workspace
 * answers — `requiredSettings` and `requiredWorkspacePermissions` — to the consumer, which evaluates
 * them against each workspace it lists. A feature flag can be turned on for one workspace alone (early
 * access values resolve into its settings), so deciding here would hide such an application from every
 * workspace that has it.
 *
 * @internal
 */
export function resolveAvailableWorkspaceApplications(
    ctx: IPlatformContext,
): PluggableApplicationRegistryItem[] {
    return resolveApplications({
        localApps: getLocalApplications(),
        remoteRegistry: getRemoteRegistry(ctx),
        ctx,
        scope: "workspace",
        skipWorkspacePermissions: true,
        skipSettings: true,
    });
}

/**
 * Builds the resolved list of pluggable applications from the local and remote registries.
 */
export function usePluggableApplications(ctx: IPlatformContext): PluggableApplicationRegistryItem[] {
    return useMemo(
        () =>
            resolveApplications({
                localApps: getLocalApplications(),
                remoteRegistry: getRemoteRegistry(ctx),
                ctx,
                scope: ctx.currentApplicationScope,
            }),
        [ctx],
    );
}
