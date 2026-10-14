// (C) 2026 GoodData Corporation

import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { NotAuthenticated } from "@gooddata/sdk-backend-spi";

import { NOT_AUTHENTICATED_GRACE_MS } from "./notAuthenticatedGrace.js";
import { type IBackendPlatformContextProvider } from "./useLoadPlatformContext.js";

const loadPlatformContext = vi.fn();

// The package runs test files in one shared module registry (isolate: false), and other files load
// useLoadPlatformContext.js with their own mocks. This file loads its own copy and drops it afterwards.
async function loadProvider(): Promise<IBackendPlatformContextProvider> {
    vi.resetModules();
    vi.doMock("./loadPlatformContext.js", () => ({
        loadPlatformContext,
        HostApplicationDisabledError: class extends Error {},
    }));
    vi.doMock("./waitForInjectedApiToken.js", () => ({
        shouldWaitForInjectedApiToken: () => false,
        waitForInjectedApiToken: vi.fn(),
    }));
    const { BackendPlatformContextProvider } = await import("./useLoadPlatformContext.js");
    return BackendPlatformContextProvider;
}

describe("BackendPlatformContextProvider", () => {
    let provider: IBackendPlatformContextProvider;

    beforeEach(async () => {
        provider = await loadProvider();
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    afterAll(() => {
        vi.doUnmock("./loadPlatformContext.js");
        vi.doUnmock("./waitForInjectedApiToken.js");
        vi.resetModules();
    });

    it("stays loading during the login redirect grace period, then reports the 401", async () => {
        vi.useFakeTimers();
        vi.spyOn(console, "error").mockImplementation(() => {});
        loadPlatformContext.mockRejectedValue(new NotAuthenticated("Not authenticated"));

        const loading = provider.load();
        await vi.advanceTimersByTimeAsync(NOT_AUTHENTICATED_GRACE_MS - 1);

        expect(provider.getResult()).toEqual({ state: "loading" });

        await vi.advanceTimersByTimeAsync(1);
        await loading;

        expect(provider.getResult()).toEqual({ state: "error", error: "Not authenticated" });
    });

    it("reports other failures immediately", async () => {
        vi.spyOn(console, "error").mockImplementation(() => {});
        loadPlatformContext.mockRejectedValue(new Error("Boom"));

        await provider.load();

        expect(provider.getResult()).toEqual({ state: "error", error: "Boom" });
    });
});
