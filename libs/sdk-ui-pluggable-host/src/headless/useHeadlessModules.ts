// (C) 2026 GoodData Corporation

import { useEffect } from "react";

import { type IPlatformContext } from "@gooddata/sdk-pluggable-application-model";

import { HeadlessModulesController } from "./HeadlessModulesController.js";
import { getHeadlessModules } from "./headlessModulesRegistry.js";

// One controller per page and principal. The host components that call the hook unmount on redirects
// and error pages, and a remount must not mount the modules again. A different user or organization
// has its own registry and identity, so it gets a new controller.
let pageController: HeadlessModulesController | undefined;
let pagePrincipal: string | undefined;
let principalChanged = false;

function principalOf(ctx: IPlatformContext): string {
    return JSON.stringify([ctx.organization?.id, ctx.user.login]);
}

function ensureController(ctx: IPlatformContext): void {
    const principal = principalOf(ctx);
    if (principal === pagePrincipal) {
        return;
    }
    principalChanged = principalChanged || pagePrincipal !== undefined;
    pageController?.dispose();
    pageController = undefined;
    pagePrincipal = principal;
    const modules = getHeadlessModules(ctx);
    if (modules.length === 0) {
        return;
    }
    pageController = new HeadlessModulesController(ctx, { canReplayPageStart: () => !principalChanged });
    void pageController.start(modules);
}

/**
 * @internal - exported for testing
 */
export function resetHeadlessModulesForTesting(): void {
    pageController?.dispose();
    pageController = undefined;
    pagePrincipal = undefined;
    principalChanged = false;
}

/**
 * Mounts the headless modules once per page and principal, and forwards every later platform context
 * of the same principal to them.
 */
export function useHeadlessModules(ctx: IPlatformContext): void {
    useEffect(() => {
        ensureController(ctx);
        pageController?.updateContext(ctx);
    }, [ctx]);
}
