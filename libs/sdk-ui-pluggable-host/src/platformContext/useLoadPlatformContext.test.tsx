// (C) 2026 GoodData Corporation

import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { type IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { type IPlatformContext } from "@gooddata/sdk-pluggable-application-model";

import { getBackend } from "./backend.js";
import { BackendPlatformContextProvider, useLoadPlatformContext } from "./useLoadPlatformContext.js";
import { useWorkspaceColorPalette } from "./useWorkspaceColorPalette.js";
import { useWorkspacePermissions } from "./useWorkspacePermissions.js";
import { useWorkspaceSettings } from "./useWorkspaceSettings.js";
import { useWorkspaceTheme } from "./useWorkspaceTheme.js";

vi.mock("react-router", () => ({
    useLocation: vi.fn(() => ({ pathname: "/workspace/ws-1/dashboards/" })),
}));

vi.mock("./backend.js", () => ({
    getBackend: vi.fn(),
}));

vi.mock("./useWorkspacePermissions.js", () => ({ useWorkspacePermissions: vi.fn() }));
vi.mock("./useWorkspaceSettings.js", () => ({ useWorkspaceSettings: vi.fn() }));
vi.mock("./useWorkspaceColorPalette.js", () => ({ useWorkspaceColorPalette: vi.fn() }));
vi.mock("./useWorkspaceTheme.js", () => ({ useWorkspaceTheme: vi.fn() }));

const ctx = {
    userSettings: { locale: "en-US" },
    theme: undefined,
} as unknown as IPlatformContext;

function setBackendContextReady(): void {
    vi.spyOn(BackendPlatformContextProvider, "subscribe").mockReturnValue(() => {});
    vi.spyOn(BackendPlatformContextProvider, "getResult").mockReturnValue({ state: "ready", ctx });
}

function setWorkspaceStates(state: "loading" | "ready"): void {
    vi.mocked(useWorkspacePermissions).mockReturnValue(
        state === "ready" ? { state, permissions: {} as never } : { state },
    );
    vi.mocked(useWorkspaceSettings).mockReturnValue(
        state === "ready" ? { state, settings: { locale: "en-US" } as never } : { state },
    );
    vi.mocked(useWorkspaceColorPalette).mockReturnValue(
        state === "ready" ? { state, colorPalette: undefined } : { state },
    );
    vi.mocked(useWorkspaceTheme).mockReturnValue(state === "ready" ? { state, theme: undefined } : { state });
}

describe("useLoadPlatformContext", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        setBackendContextReady();
        vi.mocked(getBackend).mockReturnValue({} as IAnalyticalBackend);
    });

    it("reports loading while workspace data loads for the first time", () => {
        setWorkspaceStates("loading");

        const { result } = renderHook(() => useLoadPlatformContext());

        expect(result.current.state).toBe("loading");
    });

    it("keeps the previously rendered context while the same workspace refreshes", () => {
        setWorkspaceStates("ready");
        const { result, rerender } = renderHook(() => useLoadPlatformContext());
        expect(result.current.state).toBe("ready");
        const readyCtx = (result.current as { state: "ready"; ctx: IPlatformContext }).ctx;

        setWorkspaceStates("loading");
        vi.mocked(getBackend).mockReturnValue({} as IAnalyticalBackend);
        rerender();

        expect(result.current.state).toBe("ready");
        expect((result.current as { state: "ready"; ctx: IPlatformContext }).ctx).toEqual(readyCtx);
    });

    it("merges a refreshed backend context into the kept workspace context", () => {
        setWorkspaceStates("ready");
        const { result, rerender } = renderHook(() => useLoadPlatformContext());
        expect(result.current.state).toBe("ready");

        const refreshedCtx = { ...ctx, auth: { type: "refreshed" } } as unknown as IPlatformContext;
        vi.spyOn(BackendPlatformContextProvider, "getResult").mockReturnValue({
            state: "ready",
            ctx: refreshedCtx,
        });
        setWorkspaceStates("loading");
        rerender();

        expect(result.current.state).toBe("ready");
        expect(
            (result.current as { state: "ready"; ctx: IPlatformContext & { auth: unknown } }).ctx.auth,
        ).toEqual({ type: "refreshed" });
    });

    it("shows the loader instead of reusing workspace context for a different principal", () => {
        setWorkspaceStates("ready");
        const { result, rerender } = renderHook(() => useLoadPlatformContext());
        expect(result.current.state).toBe("ready");

        const otherPrincipalCtx = {
            ...ctx,
            user: { login: "someone.else" },
        } as unknown as IPlatformContext;
        vi.spyOn(BackendPlatformContextProvider, "getResult").mockReturnValue({
            state: "ready",
            ctx: otherPrincipalCtx,
        });
        setWorkspaceStates("loading");
        rerender();

        expect(result.current.state).toBe("loading");
    });

    it("falls back to the loader when the workspace changes", async () => {
        const { useLocation } = vi.mocked(await import("react-router"));

        setWorkspaceStates("ready");
        const { result, rerender } = renderHook(() => useLoadPlatformContext());
        expect(result.current.state).toBe("ready");

        useLocation.mockReturnValue({ pathname: "/workspace/ws-2/dashboards/" } as never);
        setWorkspaceStates("loading");
        rerender();

        expect(result.current.state).toBe("loading");
    });
});
