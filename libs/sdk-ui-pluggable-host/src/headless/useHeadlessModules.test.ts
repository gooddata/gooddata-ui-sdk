// (C) 2026 GoodData Corporation

import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { type IUserSettings } from "@gooddata/sdk-model";
import {
    type IHeadlessModuleMountOptions,
    type IPlatformContext,
} from "@gooddata/sdk-pluggable-application-model";

import { registerHostTelemetryServices } from "../loader/pluggableApplicationsLoader.js";
import { type IHeadlessTelemetryProviderRegistration } from "../types/telemetryServices.js";

import { registerLocalHeadlessModules } from "./headlessModulesRegistry.js";
import { registerLocalHeadlessModuleLoaders } from "./localHeadlessLoader.js";
import { resetHeadlessModulesForTesting, useHeadlessModules } from "./useHeadlessModules.js";

function platformContext(currentWorkspaceId?: string, login = "test@example.com"): IPlatformContext {
    const userSettings: IUserSettings = {
        userId: "test-user",
        locale: "en-US",
        separators: { thousand: ",", decimal: "." },
    };
    return {
        version: "1.0",
        auth: { type: "contextDeferred" },
        user: { login, ref: { identifier: "test-user", type: "user" } },
        userSettings,
        settings: userSettings,
        whiteLabeling: undefined,
        embeddingMode: "none",
        currentWorkspaceId,
    };
}

describe("useHeadlessModules", () => {
    beforeEach(() => {
        resetHeadlessModulesForTesting();
    });

    afterEach(() => {
        resetHeadlessModulesForTesting();
        registerLocalHeadlessModules([]);
        registerLocalHeadlessModuleLoaders({});
        registerHostTelemetryServices({});
    });

    it("mounts the modules once per page, even when the calling component remounts", async () => {
        const updateContext = vi.fn();
        const unmount = vi.fn();
        const mount = vi.fn(() => ({ unmount, updateContext }));
        registerLocalHeadlessModules([{ apiVersion: "1.0", id: "telemetry", local: true }]);
        registerLocalHeadlessModuleLoaders({ telemetry: async () => ({ headlessModule: { mount } }) });

        const first = renderHook(({ ctx }) => useHeadlessModules(ctx), {
            initialProps: { ctx: platformContext("ws-1") },
        });
        await waitFor(() => expect(mount).toHaveBeenCalledTimes(1));
        first.unmount();

        const nextCtx = platformContext("ws-2");
        renderHook(({ ctx }) => useHeadlessModules(ctx), { initialProps: { ctx: nextCtx } });

        expect(mount).toHaveBeenCalledTimes(1);
        expect(unmount).not.toHaveBeenCalled();
        expect(updateContext).toHaveBeenLastCalledWith(nextCtx);
    });

    it("remounts the modules for a different principal without the page-start replay", async () => {
        const unmount = vi.fn();
        const mount = vi.fn(({ registerTelemetryProvider }: IHeadlessModuleMountOptions) => {
            registerTelemetryProvider({ trackEvent: vi.fn(), trackPageView: vi.fn() });
            return { unmount };
        });
        const registerTelemetryProvider = vi.fn(
            (_registration: IHeadlessTelemetryProviderRegistration) => () => undefined,
        );
        registerHostTelemetryServices({ registerTelemetryProvider });
        registerLocalHeadlessModules([{ apiVersion: "1.0", id: "telemetry", local: true }]);
        registerLocalHeadlessModuleLoaders({ telemetry: async () => ({ headlessModule: { mount } }) });

        const { rerender } = renderHook(({ ctx }) => useHeadlessModules(ctx), {
            initialProps: { ctx: platformContext("ws-1") },
        });
        await waitFor(() => expect(mount).toHaveBeenCalledTimes(1));

        rerender({ ctx: platformContext("ws-1", "someone.else@example.com") });

        expect(unmount).toHaveBeenCalledTimes(1);
        await waitFor(() => expect(mount).toHaveBeenCalledTimes(2));
        expect(
            registerTelemetryProvider.mock.calls.map(([registration]) => registration.replayPageStart),
        ).toEqual([true, false]);
    });
});
