// (C) 2026 GoodData Corporation

import { afterEach, describe, expect, it, vi } from "vitest";

import { type HeadlessModuleRegistryItem, type IHeadlessModuleTelemetryOptionsV1 } from "@gooddata/sdk-model";
import {
    type IHeadlessModule,
    type IHeadlessModuleMountHandle,
    type IHeadlessModuleMountOptions,
    type IPlatformContext,
    type ITelemetryProvider,
} from "@gooddata/sdk-pluggable-application-model";

import { BUILD_FRESHNESS_WINDOW_MS } from "../loader/appSecurityValidation.js";
import { type IAppLifecycleCallbacks } from "../types/lifecycle.js";

import {
    HeadlessModulesController,
    type IHeadlessModulesControllerDependencies,
    resolveTelemetryIdentityMode,
} from "./HeadlessModulesController.js";

const NOW = 1_700_000_000_000;
const HEADLESS = { kind: "headless" };
const SECURED_URL = "https://demo-dashboard-plugins.gooddata.com/acme/telemetry/remoteEntry.js";

const ctx = { organization: { id: "org-1" } } as IPlatformContext;

function provider(): ITelemetryProvider {
    return { trackEvent: vi.fn(), trackPageView: vi.fn() };
}

function localItem(
    id: string,
    config?: Record<string, unknown>,
    telemetry?: IHeadlessModuleTelemetryOptionsV1,
): HeadlessModuleRegistryItem {
    return telemetry === undefined
        ? { apiVersion: "1.0", id, local: true, config }
        : { apiVersion: "1.0", id, local: true, config, telemetry };
}

function securedItem(id: string): HeadlessModuleRegistryItem {
    return { apiVersion: "1.0", id, remote: { url: SECURED_URL, scope: id, module: "./headlessModule" } };
}

function setup(modules: Record<string, IHeadlessModule | Error>, lifecycle: IAppLifecycleCallbacks = {}) {
    const disconnect = vi.fn();
    const registerTelemetryProvider = vi.fn(() => disconnect);
    const clock = { now: NOW };
    const callbacks: IAppLifecycleCallbacks = {
        onLoadStarted: vi.fn(),
        onLoadCompleted: vi.fn(),
        onMountCompleted: vi.fn(),
        onLoadFailed: vi.fn(),
        onUnmounted: vi.fn(),
        ...lifecycle,
    };
    const deps: IHeadlessModulesControllerDependencies = {
        load: async (item) => {
            const loaded = modules[item.id];
            if (loaded instanceof Error) {
                throw loaded;
            }
            return loaded;
        },
        getLifecycle: () => callbacks,
        getTelemetryServices: () => ({ registerTelemetryProvider }),
        now: () => 0,
        clock: () => clock.now,
        canReplayPageStart: () => true,
    };
    return {
        controller: new HeadlessModulesController(ctx, deps),
        clock,
        callbacks,
        registerTelemetryProvider,
        disconnect,
    };
}

describe("HeadlessModulesController", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("mounts each module with its config and connects its telemetry provider", async () => {
        const telemetryProvider = provider();
        const mount = vi.fn(({ registerTelemetryProvider }: IHeadlessModuleMountOptions) => {
            registerTelemetryProvider(telemetryProvider);
            return { unmount: vi.fn() };
        });
        const { controller, callbacks, registerTelemetryProvider } = setup({ telemetry: { mount } });

        await controller.start([localItem("telemetry", { apiKey: "public-key" }, { identity: "userId" })]);

        expect(mount).toHaveBeenCalledWith(
            expect.objectContaining({
                id: "telemetry",
                ctx,
                config: { apiKey: "public-key" },
            }),
        );
        expect(registerTelemetryProvider).toHaveBeenCalledWith({
            moduleId: "telemetry",
            provider: telemetryProvider,
            identity: "userId",
            ctx,
            replayPageStart: true,
        });
        expect(callbacks.onLoadStarted).toHaveBeenCalledWith("telemetry", HEADLESS);
        expect(callbacks.onLoadCompleted).toHaveBeenCalledWith("telemetry", 0, HEADLESS);
        expect(callbacks.onMountCompleted).toHaveBeenCalledWith("telemetry", 0, HEADLESS);
    });

    it("keeps mounting the other modules when one fails to load or throws in mount", async () => {
        vi.spyOn(console, "error").mockImplementation(() => {});
        const healthyMount = vi.fn(() => ({ unmount: vi.fn() }));
        const { controller, callbacks } = setup({
            missing: new Error("404"),
            throwing: {
                mount: () => {
                    throw new Error("boom");
                },
            },
            healthy: { mount: healthyMount },
        });

        await controller.start([localItem("missing"), localItem("throwing"), localItem("healthy")]);

        expect(healthyMount).toHaveBeenCalledTimes(1);
        expect(callbacks.onLoadFailed).toHaveBeenCalledWith("missing", "load failed: 404", {
            kind: "headless",
            phase: "load",
        });
        expect(callbacks.onLoadFailed).toHaveBeenCalledWith("throwing", "mount threw: boom", {
            kind: "headless",
            phase: "mount",
        });
    });

    it("disconnects providers registered before mount threw", async () => {
        vi.spyOn(console, "error").mockImplementation(() => {});
        const { controller, disconnect } = setup({
            partial: {
                mount: ({ registerTelemetryProvider }) => {
                    registerTelemetryProvider(provider());
                    throw new Error("late failure");
                },
            },
        });

        await controller.start([localItem("partial")]);

        expect(disconnect).toHaveBeenCalledTimes(1);
    });

    it("treats a mount without an unmount handle as a failed mount", async () => {
        vi.spyOn(console, "error").mockImplementation(() => {});
        const { controller, callbacks } = setup({
            broken: { mount: () => undefined as unknown as IHeadlessModuleMountHandle },
        });

        await controller.start([localItem("broken")]);
        controller.updateContext(ctx);

        expect(callbacks.onMountCompleted).not.toHaveBeenCalled();
        expect(callbacks.onLoadFailed).toHaveBeenCalledTimes(1);
    });

    it("ignores a provider that a module registers after its mount failed", async () => {
        vi.spyOn(console, "error").mockImplementation(() => {});
        let registerLater: ((telemetryProvider: ITelemetryProvider) => () => void) | undefined;
        const { controller, registerTelemetryProvider } = setup({
            failing: {
                mount: (options) => {
                    registerLater = options.registerTelemetryProvider;
                    throw new Error("boom");
                },
            },
        });
        await controller.start([localItem("failing")]);

        registerLater?.(provider());

        expect(registerTelemetryProvider).not.toHaveBeenCalled();
    });

    it("tells the host not to replay the page start when the controller forbids it", async () => {
        const disconnect = vi.fn();
        const registerTelemetryProvider = vi.fn(() => disconnect);
        const controller = new HeadlessModulesController(ctx, {
            load: async () => ({
                mount: ({ registerTelemetryProvider: register }) => {
                    register(provider());
                    return { unmount: vi.fn() };
                },
            }),
            getLifecycle: () => undefined,
            getTelemetryServices: () => ({ registerTelemetryProvider }),
            now: () => 0,
            clock: () => NOW,
            canReplayPageStart: () => false,
        });

        await controller.start([localItem("telemetry")]);

        expect(registerTelemetryProvider).toHaveBeenCalledWith(
            expect.objectContaining({ replayPageStart: false }),
        );
    });

    it("rejects a module from the secured bucket that does not allow the organization", async () => {
        vi.spyOn(console, "error").mockImplementation(() => {});
        const mount = vi.fn(() => ({ unmount: vi.fn() }));
        const { controller, callbacks } = setup({
            telemetry: {
                mount,
                allowedOrganizations: ["other-org"],
                buildTimestamp: NOW - BUILD_FRESHNESS_WINDOW_MS / 2,
            },
        });

        await controller.start([securedItem("telemetry")]);

        expect(mount).not.toHaveBeenCalled();
        expect(callbacks.onLoadFailed).toHaveBeenCalledWith(
            "telemetry",
            "rejected: the module build does not allow this organization",
            { kind: "headless", phase: "security" },
        );
        expect(callbacks.onLoadCompleted).not.toHaveBeenCalled();
    });

    it("unmounts a secured module when its build expires before a context update", async () => {
        vi.spyOn(console, "error").mockImplementation(() => {});
        const order: string[] = [];
        const updateContext = vi.fn();
        const { controller, callbacks, clock, disconnect } = setup({
            telemetry: {
                mount: ({ registerTelemetryProvider }) => {
                    registerTelemetryProvider(provider());
                    return { unmount: () => order.push("unmount"), updateContext };
                },
                allowedOrganizations: ["org-1"],
                buildTimestamp: NOW - BUILD_FRESHNESS_WINDOW_MS + 1000,
            },
        });
        disconnect.mockImplementation(() => order.push("disconnect"));
        await controller.start([securedItem("telemetry")]);

        controller.updateContext(ctx);
        expect(updateContext).toHaveBeenCalledTimes(1);

        clock.now = NOW + 2000;
        controller.updateContext(ctx);
        controller.updateContext(ctx);
        controller.dispose();

        expect(updateContext).toHaveBeenCalledTimes(1);
        expect(order).toEqual(["disconnect", "unmount"]);
        expect(callbacks.onUnmounted).toHaveBeenCalledTimes(1);
        expect(callbacks.onLoadFailed).toHaveBeenCalledWith(
            "telemetry",
            "unmounted: the module build is older than the allowed freshness window",
            { kind: "headless", phase: "security" },
        );
    });

    it("forwards context updates and disconnects providers before unmount on dispose", async () => {
        const order: string[] = [];
        const updateContext = vi.fn();
        const { controller, disconnect } = setup({
            telemetry: {
                mount: ({ registerTelemetryProvider }) => {
                    registerTelemetryProvider(provider());
                    return { unmount: () => order.push("unmount"), updateContext };
                },
            },
        });
        disconnect.mockImplementation(() => order.push("disconnect"));
        await controller.start([localItem("telemetry")]);

        const nextCtx = { organization: { id: "org-1" }, currentWorkspaceId: "ws-2" } as IPlatformContext;
        controller.updateContext(nextCtx);
        controller.dispose();

        expect(updateContext).toHaveBeenCalledWith(nextCtx);
        expect(order).toEqual(["disconnect", "unmount"]);
    });

    it("ignores a provider that a module registers after a security unmount", async () => {
        vi.spyOn(console, "error").mockImplementation(() => {});
        let registerLater: ((telemetryProvider: ITelemetryProvider) => () => void) | undefined;
        const { controller, clock, registerTelemetryProvider } = setup({
            telemetry: {
                mount: (options) => {
                    registerLater = options.registerTelemetryProvider;
                    return { unmount: vi.fn() };
                },
                allowedOrganizations: ["org-1"],
                buildTimestamp: NOW - BUILD_FRESHNESS_WINDOW_MS + 1000,
            },
        });
        await controller.start([securedItem("telemetry")]);

        clock.now = NOW + 2000;
        controller.updateContext(ctx);
        registerLater?.(provider());

        expect(registerTelemetryProvider).not.toHaveBeenCalled();
    });

    it("reports rejected async updateContext and unmount as module failures", async () => {
        vi.spyOn(console, "error").mockImplementation(() => {});
        const { controller, callbacks } = setup({
            telemetry: {
                mount: () => ({
                    unmount: () => Promise.reject(new Error("unmount failed")),
                    updateContext: () => Promise.reject(new Error("update failed")),
                }),
            },
        });
        await controller.start([localItem("telemetry")]);

        controller.updateContext(ctx);
        controller.dispose();
        await new Promise((resolve) => setTimeout(resolve, 0));

        expect(callbacks.onLoadFailed).toHaveBeenCalledWith(
            "telemetry",
            "updateContext rejected: update failed",
            { kind: "headless", phase: "update" },
        );
        expect(callbacks.onLoadFailed).toHaveBeenCalledWith("telemetry", "unmount rejected: unmount failed", {
            kind: "headless",
            phase: "unmount",
        });
    });

    it("ignores a provider that a module registers after dispose", async () => {
        let registerLater: ((telemetryProvider: ITelemetryProvider) => () => void) | undefined;
        const { controller, registerTelemetryProvider } = setup({
            telemetry: {
                mount: (options) => {
                    registerLater = options.registerTelemetryProvider;
                    return { unmount: vi.fn() };
                },
            },
        });
        await controller.start([localItem("telemetry")]);
        controller.dispose();

        registerLater?.(provider());

        expect(registerTelemetryProvider).not.toHaveBeenCalled();
    });

    it("does not mount a module that finishes loading after dispose", async () => {
        let finishLoad: (loaded: IHeadlessModule) => void = () => undefined;
        const mount = vi.fn(() => ({ unmount: vi.fn() }));
        const controller = new HeadlessModulesController(ctx, {
            load: () =>
                new Promise((resolve) => {
                    finishLoad = resolve;
                }),
            getLifecycle: () => undefined,
            getTelemetryServices: () => undefined,
            now: () => 0,
            clock: () => NOW,
        });

        const started = controller.start([localItem("slow")]);
        controller.dispose();
        finishLoad({ mount });
        await started;

        expect(mount).not.toHaveBeenCalled();
    });
});

describe("resolveTelemetryIdentityMode", () => {
    it("defaults to hashed and ignores unknown values", () => {
        const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
        expect(resolveTelemetryIdentityMode(localItem("m"))).toBe("hashed");
        expect(resolveTelemetryIdentityMode(localItem("m", undefined, { identity: "email" }))).toBe("email");
        expect(resolveTelemetryIdentityMode(localItem("m", undefined, { identity: "raw" } as never))).toBe(
            "hashed",
        );
        expect(
            resolveTelemetryIdentityMode({
                ...localItem("m"),
                telemetry: "userId",
            } as HeadlessModuleRegistryItem),
        ).toBe("hashed");
        expect(warn).toHaveBeenCalledTimes(1);
        warn.mockRestore();
    });
});
