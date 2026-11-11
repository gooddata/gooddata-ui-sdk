// (C) 2026 GoodData Corporation

import { useEffect } from "react";

import { type IPlatformContext } from "@gooddata/sdk-pluggable-application-model";

import { ModuleMessageBroker } from "../messaging/ModuleMessageBroker.js";

import { HeadlessModulesController } from "./HeadlessModulesController.js";
import { getHeadlessModules } from "./headlessModulesRegistry.js";

// One controller and one message broker per page and principal. The host components that call the
// hook unmount on redirects and error pages, and a remount must not mount the modules again. A
// different user or organization has its own registry and identity, so it gets new ones.
let pageController: HeadlessModulesController | undefined;
let pageBroker: ModuleMessageBroker | undefined;
let pagePrincipal: string | undefined;
let principalChanged = false;

function principalOf(ctx: IPlatformContext): string {
    return JSON.stringify([ctx.organization?.id, ctx.user.login]);
}

function ensurePage(ctx: IPlatformContext): ModuleMessageBroker {
    const principal = principalOf(ctx);
    if (principal === pagePrincipal && pageBroker) {
        return pageBroker;
    }
    principalChanged = principalChanged || pagePrincipal !== undefined;
    pageController?.dispose();
    pageBroker?.dispose();
    pageController = undefined;
    pagePrincipal = principal;
    const broker = new ModuleMessageBroker();
    pageBroker = broker;
    const modules = getHeadlessModules(ctx);
    if (modules.length === 0) {
        broker.markSettled();
        return broker;
    }
    pageController = new HeadlessModulesController(ctx, {
        canReplayPageStart: () => !principalChanged,
        broker,
    });
    void pageController.start(modules).finally(() => broker.markSettled());
    return broker;
}

/**
 * Returns the module message broker of the page for the principal of the context. Mounts the headless
 * modules of that principal when they are not mounted yet.
 */
export function getModuleMessageBroker(ctx: IPlatformContext): ModuleMessageBroker {
    return ensurePage(ctx);
}

/**
 * @internal - exported for testing
 */
export function resetHeadlessModulesForTesting(): void {
    pageController?.dispose();
    pageBroker?.dispose();
    pageController = undefined;
    pageBroker = undefined;
    pagePrincipal = undefined;
    principalChanged = false;
}

/**
 * Mounts the headless modules once per page and principal, and forwards every later platform context
 * of the same principal to them.
 */
export function useHeadlessModules(ctx: IPlatformContext): void {
    useEffect(() => {
        ensurePage(ctx);
        pageController?.updateContext(ctx);
    }, [ctx]);
}
