// (C) 2026 GoodData Corporation

import { type IHostUiModule, type IPlatformContext } from "@gooddata/sdk-pluggable-application-model";

import { reserveHostStylesheetScope, retireHostStylesheetScope } from "../lib/stylesheetRegistry.js";
import {
    type AppSecurityFailure,
    describeSecurityFailure,
    validateRemoteModuleSecurity,
} from "../loader/appSecurityValidation.js";
import { getAppLifecycleCallbacks } from "../loader/pluggableApplicationsLoader.js";
import { loadRemoteHostUiModule } from "../loader/remoteLoader.js";
import { getRemoteRegistry } from "../registry/pluggableApplicationsRegistry.js";
import { LOCAL_HOST_UI_MODULE_ID, type PluggableModuleFailurePhase } from "../types/lifecycle.js";

import { defaultHostUiModule } from "./DefaultHostUi.js";
import { loadLocalHostUiModule } from "./localHostUiLoader.js";

export interface IResolvedHostUiModule {
    hostUiModule: IHostUiModule;
    /**
     * Id that lifecycle callbacks receive for the module. Undefined for the default module.
     */
    moduleId?: string;
    /**
     * Remote entry that the module came from. Undefined for a local or the default module.
     */
    remote?: { url: string; scope: string };
}

const DEFAULT_HOST_UI: IResolvedHostUiModule = { hostUiModule: defaultHostUiModule };

function errorMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
}

function reportHostUiFailure(
    moduleId: string,
    phase: PluggableModuleFailurePhase,
    error: string,
    details?: unknown,
): void {
    console.error(
        `[host-runtime/resolve-ui] UI module "${moduleId}" ${error}. The host uses the default host UI.`,
        details,
    );
    getAppLifecycleCallbacks()?.onLoadFailed?.(moduleId, error, { kind: "host-ui", phase });
}

/**
 * Re-runs the secured-remote checks of a host UI module against a newer context. Reports a failure
 * through the lifecycle callbacks, disables the module's stylesheets and returns true when the module
 * must be replaced.
 */
export function rejectHostUiModuleOnContextChange(
    resolved: IResolvedHostUiModule,
    ctx: IPlatformContext,
    action: "rejected" | "unmounted",
): boolean {
    const failure = validateHostUiModuleSecurity(resolved, ctx);
    if (!failure || !resolved.remote) {
        return false;
    }
    retireHostStylesheetScope(resolved.remote.url);
    reportHostUiFailure(
        resolved.remote.scope,
        "security",
        `${action}: ${describeSecurityFailure(failure)}`,
        failure,
    );
    return true;
}

/**
 * Reports a host UI module whose `mount` threw and disables its stylesheets. Returns false for the
 * default module, which has no fallback.
 */
export function rejectHostUiModuleOnMountFailure(resolved: IResolvedHostUiModule, error: unknown): boolean {
    if (!resolved.moduleId) {
        return false;
    }
    if (resolved.remote) {
        retireHostStylesheetScope(resolved.remote.url);
    }
    reportHostUiFailure(resolved.moduleId, "mount", `mount threw: ${errorMessage(error)}`, error);
    return true;
}

function validateHostUiModuleSecurity(
    resolved: IResolvedHostUiModule,
    ctx: IPlatformContext,
): AppSecurityFailure | undefined {
    return validateRemoteModuleSecurity(resolved.remote?.url, resolved.hostUiModule, ctx);
}

/**
 * Resolves the host UI module to use.
 *
 * A local host UI module registered with `registerLocalHostUiModuleLoader` wins. Otherwise, if the
 * remote pluggable applications registry specifies a `uiModule`, it is loaded via module federation and
 * must pass the secured-remote checks. Otherwise, or when loading or a check fails, the built-in default
 * host UI is used. With `useDefault`, the default host UI is used without looking at the others.
 * Failures go to the lifecycle callbacks with the `host-ui` kind.
 */
export async function resolveHostUiModule(
    ctx: IPlatformContext,
    useDefault = false,
): Promise<IResolvedHostUiModule> {
    if (useDefault) {
        return DEFAULT_HOST_UI;
    }

    try {
        const localModule = await loadLocalHostUiModule();
        if (localModule) {
            return { hostUiModule: localModule, moduleId: LOCAL_HOST_UI_MODULE_ID };
        }
    } catch (error) {
        reportHostUiFailure(LOCAL_HOST_UI_MODULE_ID, "load", `load failed: ${errorMessage(error)}`, error);
        return DEFAULT_HOST_UI;
    }

    const uiModule = getRemoteRegistry(ctx)?.uiModule;
    if (!uiModule) {
        return DEFAULT_HOST_UI;
    }

    reserveHostStylesheetScope(uiModule.url);
    let resolved: IResolvedHostUiModule;
    try {
        resolved = {
            hostUiModule: await loadRemoteHostUiModule(uiModule),
            moduleId: uiModule.scope,
            remote: { url: uiModule.url, scope: uiModule.scope },
        };
    } catch (error) {
        retireHostStylesheetScope(uiModule.url);
        reportHostUiFailure(uiModule.scope, "load", `load failed: ${errorMessage(error)}`, error);
        return DEFAULT_HOST_UI;
    }

    const failure = validateHostUiModuleSecurity(resolved, ctx);
    if (failure) {
        retireHostStylesheetScope(uiModule.url);
        reportHostUiFailure(
            uiModule.scope,
            "security",
            `rejected: ${describeSecurityFailure(failure)}`,
            failure,
        );
        return DEFAULT_HOST_UI;
    }
    return resolved;
}
