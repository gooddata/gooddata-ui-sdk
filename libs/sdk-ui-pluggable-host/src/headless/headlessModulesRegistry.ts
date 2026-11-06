// (C) 2026 GoodData Corporation

import {
    type HeadlessModuleRegistryItem,
    evaluateCondition,
    isLocalHeadlessModuleRegistryItem,
    isRemoteHeadlessModuleRegistryItem,
} from "@gooddata/sdk-model";
import { type IPlatformContext } from "@gooddata/sdk-pluggable-application-model";

import {
    entitlementsToRecord,
    getApplicationRemoteScopes,
    getRemoteRegistry,
    toPluggableApplicationOrganizationPermissions,
} from "../registry/pluggableApplicationsRegistry.js";

const SUPPORTED_API_VERSION = "1.0";

let registeredLocalModules: HeadlessModuleRegistryItem[] = [];

/**
 * Registers headless modules deployed with the host. Called by the host or a harness before rendering.
 *
 * @alpha
 */
export function registerLocalHeadlessModules(modules: HeadlessModuleRegistryItem[]): void {
    registeredLocalModules = modules;
}

function isNonEmptyString(value: unknown): value is string {
    return typeof value === "string" && value.length > 0;
}

// The registry is an organization setting that the backend stores without validation.
function isValidItem(item: unknown, allowLocal: boolean): item is HeadlessModuleRegistryItem {
    if (typeof item !== "object" || item === null) {
        return false;
    }
    const candidate = item as HeadlessModuleRegistryItem;
    if (candidate.apiVersion !== SUPPORTED_API_VERSION || !isNonEmptyString(candidate.id)) {
        return false;
    }
    if (candidate.isEnabled !== undefined && typeof candidate.isEnabled !== "boolean") {
        return false;
    }
    if (isRemoteHeadlessModuleRegistryItem(candidate)) {
        if (typeof candidate.remote !== "object" || candidate.remote === null) {
            return false;
        }
        const { url, scope, module } = candidate.remote;
        return isNonEmptyString(url) && isNonEmptyString(scope) && isNonEmptyString(module);
    }
    // The organization setting must not activate a module that the host bundles but does not register.
    return allowLocal && isLocalHeadlessModuleRegistryItem(candidate);
}

function validItems(items: unknown, source: "local" | "remote"): HeadlessModuleRegistryItem[] {
    if (items === undefined) {
        return [];
    }
    if (!Array.isArray(items)) {
        console.error(`[host-runtime/headless] ${source} headlessModules is not an array and is ignored.`);
        return [];
    }
    return items.filter((item: unknown) => {
        if (isValidItem(item, source === "local")) {
            return true;
        }
        console.error(
            `[host-runtime/headless] Invalid headless module in ${source} registry is ignored.`,
            item,
        );
        return false;
    });
}

function meetsRequirementsSafely(item: HeadlessModuleRegistryItem, ctx: IPlatformContext): boolean {
    try {
        return meetsRequirements(item, ctx);
    } catch (error) {
        console.error(
            `[host-runtime/headless] Headless module "${item.id}" has invalid requirements and is ignored.`,
            error,
        );
        return false;
    }
}

function isConditionObject(condition: unknown): boolean {
    return typeof condition === "object" && condition !== null && !Array.isArray(condition);
}

function meetsRequirements(item: HeadlessModuleRegistryItem, ctx: IPlatformContext): boolean {
    const { requiredSettings, requiredEntitlements, requiredOrganizationPermissions } = item;
    // evaluateCondition treats an array or another value without keys as a condition with no rule.
    const conditions = [requiredSettings, requiredEntitlements, requiredOrganizationPermissions];
    if (conditions.some((condition) => condition !== undefined && !isConditionObject(condition))) {
        throw new Error("a requirement is not a condition object");
    }
    if (requiredSettings !== undefined && !evaluateCondition(requiredSettings, ctx.userSettings)) {
        return false;
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
    return (
        requiredEntitlements === undefined ||
        evaluateCondition(requiredEntitlements, entitlementsToRecord(ctx.entitlements))
    );
}

/**
 * Resolves the headless modules to mount: local modules first, then remote modules with an id that no
 * local module uses. Drops invalid, disabled and unmet modules. Export mode mounts no headless module.
 *
 * @internal - exported for testing
 */
export function resolveHeadlessModules(
    localModules: unknown,
    remoteModules: unknown,
    ctx: IPlatformContext,
    applicationScopes: ReadonlyMap<string, string> = new Map(),
): HeadlessModuleRegistryItem[] {
    if (ctx.isExportMode === true) {
        return [];
    }
    const seenIds = new Set<string>();
    const seenScopes = new Map<string, string>();
    const merged: HeadlessModuleRegistryItem[] = [];
    for (const item of [...validItems(localModules, "local"), ...validItems(remoteModules, "remote")]) {
        if (seenIds.has(item.id)) {
            console.error(`[host-runtime/headless] Duplicate headless module id "${item.id}" is ignored.`);
            continue;
        }
        seenIds.add(item.id);
        if (item.isEnabled === false || !meetsRequirementsSafely(item, ctx)) {
            continue;
        }
        if (isRemoteHeadlessModuleRegistryItem(item)) {
            // One federation scope points to one URL only, and the modules load in parallel with each
            // other and with the active application.
            const { scope, url } = item.remote;
            const applicationUrl = applicationScopes.get(scope);
            if (applicationUrl !== undefined && applicationUrl !== url) {
                console.error(
                    `[host-runtime/headless] Headless module "${item.id}" uses the scope "${scope}" of a pluggable application with another URL and is ignored.`,
                );
                continue;
            }
            const moduleUrl = seenScopes.get(scope);
            if (moduleUrl !== undefined && moduleUrl !== url) {
                console.error(
                    `[host-runtime/headless] Headless module "${item.id}" uses the scope "${scope}" of another module with another URL and is ignored.`,
                );
                continue;
            }
            seenScopes.set(scope, url);
        }
        merged.push(item);
    }
    return merged;
}

export function getHeadlessModules(ctx: IPlatformContext): HeadlessModuleRegistryItem[] {
    return resolveHeadlessModules(
        registeredLocalModules,
        getRemoteRegistry(ctx)?.headlessModules,
        ctx,
        getApplicationRemoteScopes(ctx),
    );
}
