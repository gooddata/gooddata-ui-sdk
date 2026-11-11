// (C) 2026 GoodData Corporation

import {
    type HeadlessModuleRegistryItem,
    isHeadlessTelemetryModuleRegistryItem,
    isRemoteHeadlessModuleRegistryItem,
} from "@gooddata/sdk-model";
import {
    type IHeadlessModule,
    type IHeadlessModuleMountHandle,
    type IPlatformContext,
    type ITelemetryProvider,
    type TelemetryIdentityMode,
} from "@gooddata/sdk-pluggable-application-model";

import { now } from "../debug.js";
import { isThenable } from "../lib/isThenable.js";
import {
    type AppSecurityFailure,
    describeSecurityFailure,
    validateRemoteModuleSecurity,
} from "../loader/appSecurityValidation.js";
import { getAppLifecycleCallbacks, getHostTelemetryServices } from "../loader/pluggableApplicationsLoader.js";
import {
    type IHeadlessModuleMessagingPort,
    type ModuleMessageBroker,
} from "../messaging/ModuleMessageBroker.js";
import {
    type IAppLifecycleCallbacks,
    type IPluggableModuleLifecycleInfo,
    type PluggableModuleFailurePhase,
} from "../types/lifecycle.js";
import { type IHostTelemetryServices } from "../types/telemetryServices.js";

import { loadHeadlessModule } from "./headlessModuleLoader.js";

const IDENTITY_MODES: ReadonlySet<string> = new Set<TelemetryIdentityMode>(["hashed", "userId", "email"]);

export interface IHeadlessModulesControllerDependencies {
    load: (item: HeadlessModuleRegistryItem) => Promise<IHeadlessModule>;
    getLifecycle: () => IAppLifecycleCallbacks | undefined;
    getTelemetryServices: () => IHostTelemetryServices | undefined;
    now: () => number;
    clock: () => number;
    canReplayPageStart: () => boolean;
    broker?: ModuleMessageBroker;
}

const defaultDependencies: IHeadlessModulesControllerDependencies = {
    load: loadHeadlessModule,
    getLifecycle: getAppLifecycleCallbacks,
    getTelemetryServices: getHostTelemetryServices,
    now,
    clock: Date.now,
    canReplayPageStart: () => true,
};

interface IModuleRegistrationState {
    active: boolean;
    unregisters: Set<() => void>;
}

interface IMountedHeadlessModule {
    item: HeadlessModuleRegistryItem;
    headlessModule: IHeadlessModule;
    handle: IHeadlessModuleMountHandle;
    registration: IModuleRegistrationState;
    messaging?: IHeadlessModuleMessagingPort;
}

const HEADLESS: IPluggableModuleLifecycleInfo = { kind: "headless" };

export function resolveTelemetryIdentityMode(item: HeadlessModuleRegistryItem): TelemetryIdentityMode {
    if (!isHeadlessTelemetryModuleRegistryItem(item)) {
        return "hashed";
    }
    const identity: unknown = item.telemetry.identity;
    if (identity === undefined) {
        return "hashed";
    }
    if (typeof identity === "string" && IDENTITY_MODES.has(identity)) {
        return identity as TelemetryIdentityMode;
    }
    console.warn(
        `[host-runtime/headless] Headless module "${item.id}" has an unknown telemetry.identity value. ` +
            `The host uses "hashed".`,
    );
    return "hashed";
}

function errorMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
}

/**
 * Mounts headless modules once and keeps them mounted until {@link HeadlessModulesController.dispose}.
 * A context update that fails the security check of a module unmounts that module. A module that fails to load, fails the security check or throws never affects the other modules or
 * the host.
 */
export class HeadlessModulesController {
    private readonly mounted = new Map<string, IMountedHeadlessModule>();
    private disposed = false;
    private ctx: IPlatformContext;

    constructor(ctx: IPlatformContext, deps: Partial<IHeadlessModulesControllerDependencies> = {}) {
        this.ctx = ctx;
        this.deps = { ...defaultDependencies, ...deps };
    }

    private readonly deps: IHeadlessModulesControllerDependencies;

    public async start(items: HeadlessModuleRegistryItem[]): Promise<void> {
        await Promise.all(items.map((item) => this.loadAndMount(item)));
    }

    public updateContext(ctx: IPlatformContext): void {
        this.ctx = ctx;
        for (const [moduleId, mounted] of this.mounted) {
            const securityFailure = this.validateSecurity(mounted.item, mounted.headlessModule);
            if (securityFailure) {
                this.unmount(moduleId, mounted);
                this.reportFailure(
                    moduleId,
                    "security",
                    `unmounted: ${describeSecurityFailure(securityFailure)}`,
                );
                continue;
            }
            this.isolate(moduleId, "update", "updateContext", () => mounted.handle.updateContext?.(ctx));
        }
    }

    public dispose(): void {
        this.disposed = true;
        for (const [moduleId, mounted] of this.mounted) {
            this.unmount(moduleId, mounted);
        }
    }

    private unmount(moduleId: string, mounted: IMountedHeadlessModule): void {
        this.mounted.delete(moduleId);
        mounted.registration.active = false;
        this.unregisterAll(mounted.registration.unregisters);
        mounted.messaging?.close();
        this.isolate(moduleId, "unmount", "unmount", () => mounted.handle.unmount());
        this.deps.getLifecycle()?.onUnmounted?.(moduleId, HEADLESS);
    }

    private validateSecurity(
        item: HeadlessModuleRegistryItem,
        headlessModule: IHeadlessModule,
    ): AppSecurityFailure | undefined {
        return isRemoteHeadlessModuleRegistryItem(item)
            ? validateRemoteModuleSecurity(item.remote.url, headlessModule, this.ctx, this.deps.clock())
            : undefined;
    }

    // A module can implement the void lifecycle callbacks as async functions.
    private isolate(
        moduleId: string,
        phase: PluggableModuleFailurePhase,
        callback: string,
        call: () => unknown,
    ): void {
        try {
            const result = call();
            if (isThenable(result)) {
                result.then(undefined, (error: unknown) =>
                    this.reportFailure(moduleId, phase, `${callback} rejected: ${errorMessage(error)}`),
                );
            }
        } catch (error) {
            this.reportFailure(moduleId, phase, `${callback} threw: ${errorMessage(error)}`);
        }
    }

    private async loadAndMount(item: HeadlessModuleRegistryItem): Promise<void> {
        this.deps.getLifecycle()?.onLoadStarted?.(item.id, HEADLESS);
        const loadStart = this.deps.now();
        let headlessModule: IHeadlessModule;
        try {
            headlessModule = await this.deps.load(item);
        } catch (error) {
            this.reportFailure(item.id, "load", `load failed: ${errorMessage(error)}`);
            return;
        }
        if (this.disposed) {
            return;
        }

        const securityFailure = this.validateSecurity(item, headlessModule);
        if (securityFailure) {
            this.reportFailure(item.id, "security", `rejected: ${describeSecurityFailure(securityFailure)}`);
            return;
        }
        this.deps.getLifecycle()?.onLoadCompleted?.(item.id, this.deps.now() - loadStart, HEADLESS);

        const mountStart = this.deps.now();

        const registration: IModuleRegistrationState = { active: true, unregisters: new Set() };
        const identity = resolveTelemetryIdentityMode(item);
        const messaging = this.deps.broker?.connectHeadlessModule(item.id);
        try {
            const handle = headlessModule.mount({
                id: item.id,
                ctx: this.ctx,
                config: item.config ?? {},
                registerTelemetryProvider: (provider) =>
                    this.registerProvider(item.id, identity, provider, registration),
                ...(messaging
                    ? {
                          registerChannel: messaging.registerChannel,
                          postToActiveApplication: messaging.postToActiveApplication,
                          moduleMessaging: messaging.moduleMessaging,
                      }
                    : {}),
            });
            if (typeof handle?.unmount !== "function") {
                throw new Error("mount did not return a handle with unmount()");
            }
            this.mounted.set(item.id, {
                item,
                headlessModule,
                handle,
                registration,
                messaging,
            });
            if (messaging && typeof handle.onActiveApplicationChanged === "function") {
                messaging.setActiveApplicationListener((application) =>
                    handle.onActiveApplicationChanged?.(application),
                );
            }
        } catch (error) {
            registration.active = false;
            this.unregisterAll(registration.unregisters);
            messaging?.close();
            this.reportFailure(item.id, "mount", `mount threw: ${errorMessage(error)}`);
            return;
        }
        this.deps.getLifecycle()?.onMountCompleted?.(item.id, this.deps.now() - mountStart, HEADLESS);
    }

    private registerProvider(
        moduleId: string,
        identity: TelemetryIdentityMode,
        provider: ITelemetryProvider,
        registration: IModuleRegistrationState,
    ): () => void {
        const register = this.deps.getTelemetryServices()?.registerTelemetryProvider;
        if (this.disposed || !registration.active || !register) {
            return () => undefined;
        }

        const { unregisters } = registration;
        const disconnect = register({
            moduleId,
            provider,
            identity,
            ctx: this.ctx,
            replayPageStart: this.deps.canReplayPageStart(),
        });
        const unregister = () => {
            if (!unregisters.delete(unregister)) {
                return;
            }
            try {
                disconnect();
            } catch (error) {
                this.reportFailure(
                    moduleId,
                    "unmount",
                    `provider unregistration threw: ${errorMessage(error)}`,
                );
            }
        };
        unregisters.add(unregister);
        return unregister;
    }

    private unregisterAll(unregisters: Set<() => void>): void {
        [...unregisters].forEach((unregister) => unregister());
    }

    private reportFailure(moduleId: string, phase: PluggableModuleFailurePhase, message: string): void {
        console.error(`[host-runtime/headless] Headless module "${moduleId}": ${message}`);
        this.deps.getLifecycle()?.onLoadFailed?.(moduleId, message, { kind: "headless", phase });
    }
}
