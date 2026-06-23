// (C) 2026 GoodData Corporation

import { describe, expect, it, vi } from "vitest";

import { type IPluggableAppTelemetryCallbacks } from "@gooddata/sdk-pluggable-application-model";

import { enrichTelemetryCallbacks } from "./telemetry.js";

function createCallbacks(): IPluggableAppTelemetryCallbacks {
    return {
        trackEvent: vi.fn(),
        trackPageView: vi.fn(),
        trackTiming: vi.fn(),
    };
}

const metadata = { moduleReactVersion: "19.1.1", moduleSdkVersion: "1.2.3" };

describe("enrichTelemetryCallbacks", () => {
    it("returns undefined when given undefined callbacks", () => {
        expect(enrichTelemetryCallbacks(undefined, metadata)).toBeUndefined();
    });

    it("injects module metadata into trackEvent data", () => {
        const callbacks = createCallbacks();
        const enriched = enrichTelemetryCallbacks(callbacks, metadata)!;

        enriched.trackEvent("appOpened", { workspaceId: "ws-1" }, { channel: "ai" });

        expect(callbacks.trackEvent).toHaveBeenCalledWith(
            "appOpened",
            { moduleReactVersion: "19.1.1", moduleSdkVersion: "1.2.3", workspaceId: "ws-1" },
            { channel: "ai" },
        );
    });

    it("attaches metadata even when the call site passes no data", () => {
        const callbacks = createCallbacks();
        const enriched = enrichTelemetryCallbacks(callbacks, metadata)!;

        enriched.trackEvent("appOpened");

        expect(callbacks.trackEvent).toHaveBeenCalledWith("appOpened", metadata, undefined);
    });

    it("lets an explicit data key win over metadata on collision", () => {
        const callbacks = createCallbacks();
        const enriched = enrichTelemetryCallbacks(callbacks, metadata)!;

        enriched.trackEvent("appOpened", { moduleReactVersion: "override" });

        expect(callbacks.trackEvent).toHaveBeenCalledWith(
            "appOpened",
            { moduleReactVersion: "override", moduleSdkVersion: "1.2.3" },
            undefined,
        );
    });

    it("injects module metadata into trackPageView and trackTiming data", () => {
        const callbacks = createCallbacks();
        const enriched = enrichTelemetryCallbacks(callbacks, metadata)!;

        enriched.trackPageView("/dashboards", { identifiers: { workspaceId: "ws-1" } });
        expect(callbacks.trackPageView).toHaveBeenCalledWith("/dashboards", {
            moduleReactVersion: "19.1.1",
            moduleSdkVersion: "1.2.3",
            identifiers: { workspaceId: "ws-1" },
        });

        enriched.trackTiming("load", "kd", 123, { category: "dashboards" });
        expect(callbacks.trackTiming).toHaveBeenCalledWith("load", "kd", 123, {
            moduleReactVersion: "19.1.1",
            moduleSdkVersion: "1.2.3",
            category: "dashboards",
        });
    });

    it("passes the optional logRecord callback through unchanged", () => {
        const logRecord = vi.fn();
        const callbacks: IPluggableAppTelemetryCallbacks = { ...createCallbacks(), logRecord };
        const enriched = enrichTelemetryCallbacks(callbacks, metadata)!;

        expect(enriched.logRecord).toBe(logRecord);
    });
});
