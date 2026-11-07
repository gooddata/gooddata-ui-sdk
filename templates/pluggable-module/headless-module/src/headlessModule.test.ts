// (C) 2026 GoodData Corporation

import { describe, expect, it, vi } from "vitest";

import { type IPlatformContext, type ITelemetryProvider } from "@gooddata/sdk-pluggable-application-model";

import { createTelemetryProvider, headlessModule } from "./headlessModule.js";

describe("headlessModule", () => {
    it("registers one telemetry provider and unregisters it on unmount", () => {
        const unregister = vi.fn();
        const registerTelemetryProvider = vi.fn((_provider: ITelemetryProvider) => unregister);

        const handle = headlessModule.mount({
            id: "gdc-headless-template-name",
            ctx: {} as IPlatformContext,
            config: {},
            registerTelemetryProvider,
        });

        expect(registerTelemetryProvider).toHaveBeenCalledTimes(1);
        handle.unmount();
        expect(unregister).toHaveBeenCalledTimes(1);
    });
});

describe("createTelemetryProvider", () => {
    it("writes events with the configured prefix", () => {
        const info = vi.spyOn(console, "info").mockImplementation(() => {});

        createTelemetryProvider({ logPrefix: "[test]" }).trackEvent("app-load-completed", {
            sourceApplication: "gdc-dashboards",
        });

        expect(info).toHaveBeenCalledWith("[test]", "event", "app-load-completed", {
            sourceApplication: "gdc-dashboards",
        });
    });
});
