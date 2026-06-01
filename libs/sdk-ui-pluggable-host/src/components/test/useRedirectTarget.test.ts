// (C) 2026 GoodData Corporation

import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { type PluggableApplicationRegistryItem } from "@gooddata/sdk-model";
import { type EmbeddingMode, type IPlatformContext } from "@gooddata/sdk-pluggable-application-model";

import { AppNotFoundError, resolveRedirectTarget } from "../../loader/redirectLogic.js";
import { useRedirectTarget } from "../useRedirectTarget.js";

vi.mock("../../loader/redirectLogic.js", async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...(actual as object),
        resolveRedirectTarget: vi.fn(),
    };
});

const mockResolveRedirectTarget = vi.mocked(resolveRedirectTarget);

const userSettings = {} as IPlatformContext["userSettings"];
const ctx: IPlatformContext = {
    version: "1.0",
    auth: { type: "contextDeferred" as const },
    user: { login: "test@example.com" } as IPlatformContext["user"],
    userSettings,
    settings: userSettings,
    whiteLabeling: undefined,
    embeddingMode: "none" as EmbeddingMode,
};

const apps: PluggableApplicationRegistryItem[] = [];

describe("useRedirectTarget", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("starts in loading state before the async resolution completes", () => {
        mockResolveRedirectTarget.mockReturnValue(new Promise(() => undefined));

        const { result } = renderHook(() => useRedirectTarget(apps, ctx, "/workspace/ws-123"));

        expect(result.current).toEqual({ state: "loading" });
    });

    it("transitions to render when resolveRedirectTarget returns null", async () => {
        mockResolveRedirectTarget.mockResolvedValue(null);

        const { result } = renderHook(() => useRedirectTarget(apps, ctx, "/workspace/ws-123/dashboards"));

        await waitFor(() => expect(result.current).toEqual({ state: "render" }));
    });

    it("transitions to redirect with URL when a redirect target is returned", async () => {
        mockResolveRedirectTarget.mockResolvedValue("/workspace/ws-123/dashboards");

        const { result } = renderHook(() => useRedirectTarget(apps, ctx, "/"));

        await waitFor(() =>
            expect(result.current).toEqual({ state: "redirect", url: "/workspace/ws-123/dashboards" }),
        );
    });

    it("transitions to not-found when AppNotFoundError is thrown", async () => {
        mockResolveRedirectTarget.mockRejectedValue(new AppNotFoundError("Nothing here."));

        const { result } = renderHook(() => useRedirectTarget(apps, ctx, "/organization/unknown"));

        await waitFor(() => expect(result.current).toEqual({ state: "not-found" }));
    });

    it("transitions to error with message when an unexpected error is thrown", async () => {
        mockResolveRedirectTarget.mockRejectedValue(new Error("Unexpected backend failure"));

        const { result } = renderHook(() => useRedirectTarget(apps, ctx, "/workspace/ws-123"));

        await waitFor(() =>
            expect(result.current).toEqual({ state: "error", error: "Unexpected backend failure" }),
        );
    });

    it("stays in render state during re-resolution when pathname changes", async () => {
        mockResolveRedirectTarget.mockResolvedValue(null);

        const { result, rerender } = renderHook(
            ({ pathname }: { pathname: string }) => useRedirectTarget(apps, ctx, pathname),
            { initialProps: { pathname: "/workspace/ws-123/dashboards" } },
        );

        await waitFor(() => expect(result.current).toEqual({ state: "render" }));

        rerender({ pathname: "/workspace/ws-123/catalog" });

        // Stays in render while async resolution runs — prevents HostUiContainer unmount flicker
        expect(result.current).toEqual({ state: "render" });

        await waitFor(() => expect(result.current).toEqual({ state: "render" }));
        expect(mockResolveRedirectTarget).toHaveBeenCalledTimes(2);
    });

    it("resets to loading when re-resolving from a non-render state", async () => {
        mockResolveRedirectTarget.mockRejectedValueOnce(new AppNotFoundError("Not found"));

        const { result, rerender } = renderHook(
            ({ pathname }: { pathname: string }) => useRedirectTarget(apps, ctx, pathname),
            { initialProps: { pathname: "/organization/unknown" } },
        );

        await waitFor(() => expect(result.current).toEqual({ state: "not-found" }));

        // Navigate to a new path — should reset to loading since we're in "not-found", not "render"
        mockResolveRedirectTarget.mockResolvedValue(null);
        rerender({ pathname: "/workspace/ws-123/dashboards" });

        expect(result.current).toEqual({ state: "loading" });

        await waitFor(() => expect(result.current).toEqual({ state: "render" }));
    });
});
