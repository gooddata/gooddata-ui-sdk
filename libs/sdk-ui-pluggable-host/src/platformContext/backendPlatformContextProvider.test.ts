// (C) 2026 GoodData Corporation

import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { NotAuthenticated } from "@gooddata/sdk-backend-spi";

import { NOT_AUTHENTICATED_GRACE_MS } from "./notAuthenticatedGrace.js";
import { type IBackendPlatformContextProvider } from "./useLoadPlatformContext.js";

const loadPlatformContext = vi.fn();
const waitForInjectedApiToken = vi.fn();
const checkInjectedTokenOrigin = vi.fn();
const reinitializeBackend = vi.fn();

class EmbeddingOriginRejectedError extends Error {
    constructor(public readonly origin: string) {
        super(`The embedding parent origin "${origin}" is not allowed.`);
    }
}

// The package runs test files in one shared module registry (isolate: false), and other files load
// useLoadPlatformContext.js with their own mocks. This file loads its own copy and drops it afterwards.
async function loadProvider(withInjectedToken = false): Promise<IBackendPlatformContextProvider> {
    vi.resetModules();
    vi.doMock("./loadPlatformContext.js", () => ({
        loadPlatformContext,
    }));
    vi.doMock("./waitForInjectedApiToken.js", () => ({
        shouldWaitForInjectedApiToken: () => withInjectedToken,
        waitForInjectedApiToken,
    }));
    vi.doMock("./checkInjectedTokenOrigin.js", () => ({
        checkInjectedTokenOrigin,
        EmbeddingOriginRejectedError,
    }));
    vi.doMock("./backend.js", async (importOriginal) => ({
        ...(await importOriginal<object>()),
        reinitializeBackend,
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
        vi.doUnmock("./checkInjectedTokenOrigin.js");
        vi.doUnmock("./backend.js");
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

    describe("origin of the injected token", () => {
        const PARENT = "https://parent.example.com";
        const injected = { token: "secret", type: "gooddata", origin: PARENT, isFromParent: true };
        const ctx = { userSettings: { enableEmbeddingOriginValidation: true } };

        beforeEach(async () => {
            provider = await loadProvider(true);
            waitForInjectedApiToken.mockResolvedValue(injected);
            loadPlatformContext.mockResolvedValue(ctx);
        });

        afterEach(() => {
            vi.clearAllMocks();
        });

        it("adds the validated origin to the context", async () => {
            checkInjectedTokenOrigin.mockResolvedValue(PARENT);

            await provider.load();

            expect(checkInjectedTokenOrigin).toHaveBeenCalledWith(injected, ctx.userSettings);
            expect(provider.getResult()).toEqual({
                state: "ready",
                ctx: { ...ctx, embeddingParentOrigin: PARENT },
            });
        });

        it("adds no origin when a window other than the parent sent the token", async () => {
            waitForInjectedApiToken.mockResolvedValue({ ...injected, isFromParent: false });
            checkInjectedTokenOrigin.mockResolvedValue(PARENT);

            await provider.load();

            expect(provider.getResult()).toEqual({ state: "ready", ctx });
        });

        it("adds no origin when the check returns none (validation off)", async () => {
            checkInjectedTokenOrigin.mockResolvedValue(undefined);

            await provider.load();

            expect(provider.getResult()).toEqual({ state: "ready", ctx });
        });

        it("discards the token, stays in the error state and does not wait for a token again", async () => {
            vi.spyOn(console, "warn").mockImplementation(() => {});
            checkInjectedTokenOrigin.mockRejectedValue(new EmbeddingOriginRejectedError(PARENT));

            await provider.load();

            expect(reinitializeBackend).toHaveBeenCalledWith();
            expect(provider.getResult()).toEqual({
                state: "error",
                error: `The embedding parent origin "${PARENT}" is not allowed.`,
            });

            await provider.load();

            expect(waitForInjectedApiToken).toHaveBeenCalledTimes(1);
            expect(provider.getResult().state).toBe("error");
        });
    });
});
