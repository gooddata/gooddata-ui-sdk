// (C) 2026 GoodData Corporation

import { afterEach, describe, expect, it, vi } from "vitest";

import { NotAuthenticated } from "@gooddata/sdk-backend-spi";

import { loadPlatformContext } from "./loadPlatformContext.js";
import { NOT_AUTHENTICATED_GRACE_MS } from "./notAuthenticatedGrace.js";
import { BackendPlatformContextProvider } from "./useLoadPlatformContext.js";

vi.mock("./loadPlatformContext.js", () => ({
    loadPlatformContext: vi.fn(),
    HostApplicationDisabledError: class extends Error {},
}));

vi.mock("./waitForInjectedApiToken.js", () => ({
    shouldWaitForInjectedApiToken: () => false,
    waitForInjectedApiToken: vi.fn(),
}));

describe("BackendPlatformContextProvider", () => {
    afterEach(() => {
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    it("stays loading during the login redirect grace period, then reports the 401", async () => {
        vi.useFakeTimers();
        vi.spyOn(console, "error").mockImplementation(() => {});
        vi.mocked(loadPlatformContext).mockRejectedValue(new NotAuthenticated("Not authenticated"));

        const loading = BackendPlatformContextProvider.load();
        await vi.advanceTimersByTimeAsync(NOT_AUTHENTICATED_GRACE_MS - 1);

        expect(BackendPlatformContextProvider.getResult()).toEqual({ state: "loading" });

        await vi.advanceTimersByTimeAsync(1);
        await loading;

        expect(BackendPlatformContextProvider.getResult()).toEqual({
            state: "error",
            error: "Not authenticated",
        });
    });

    it("reports other failures immediately", async () => {
        vi.spyOn(console, "error").mockImplementation(() => {});
        vi.mocked(loadPlatformContext).mockRejectedValue(new Error("Boom"));

        await BackendPlatformContextProvider.load();

        expect(BackendPlatformContextProvider.getResult()).toEqual({ state: "error", error: "Boom" });
    });
});
