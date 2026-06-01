// (C) 2026 GoodData Corporation

import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
    UnexpectedResponseError,
    type IAnalyticalBackend,
    type IUserWorkspaceSettings,
} from "@gooddata/sdk-backend-spi";

import { useWorkspaceSettings } from "../useWorkspaceSettings.js";

type SettingsFetcher = () => Promise<IUserWorkspaceSettings>;

function mockBackend(getSettingsForCurrentUser: SettingsFetcher): IAnalyticalBackend {
    return {
        workspace: () => ({
            settings: () => ({ getSettingsForCurrentUser }),
        }),
    } as unknown as IAnalyticalBackend;
}

const stubSettings = {} as IUserWorkspaceSettings;

describe("useWorkspaceSettings", () => {
    it("returns idle immediately when backend is undefined", () => {
        const { result } = renderHook(() => useWorkspaceSettings(undefined, "ws-123"));
        expect(result.current).toEqual({ state: "idle" });
    });

    it("returns idle immediately when workspaceId is undefined", () => {
        const backend = mockBackend(vi.fn());
        const { result } = renderHook(() => useWorkspaceSettings(backend, undefined));
        expect(result.current).toEqual({ state: "idle" });
    });

    it("transitions through loading then resolves to ready on success", async () => {
        const getSettingsForCurrentUser = vi.fn().mockResolvedValue(stubSettings);
        const backend = mockBackend(getSettingsForCurrentUser);

        const { result } = renderHook(() => useWorkspaceSettings(backend, "ws-123"));

        expect(result.current.state).toBe("loading");

        await waitFor(() => expect(result.current.state).toBe("ready"));
        expect((result.current as { state: "ready"; settings: IUserWorkspaceSettings }).settings).toBe(
            stubSettings,
        );
    });

    it("transitions to error state when the fetch fails", async () => {
        const getSettingsForCurrentUser = vi.fn().mockRejectedValue(new Error("Settings fetch failed"));
        const backend = mockBackend(getSettingsForCurrentUser);

        const { result } = renderHook(() => useWorkspaceSettings(backend, "ws-123"));

        await waitFor(() => expect(result.current.state).toBe("error"));
        expect((result.current as { state: "error"; error: string }).error).toBe("Settings fetch failed");
    });

    it("uses the fallback message when a non-Error is thrown", async () => {
        const getSettingsForCurrentUser = vi.fn().mockRejectedValue("raw string error");
        const backend = mockBackend(getSettingsForCurrentUser);

        const { result } = renderHook(() => useWorkspaceSettings(backend, "ws-123"));

        await waitFor(() => expect(result.current.state).toBe("error"));
        expect((result.current as { state: "error"; error: string }).error).toBe(
            "Unknown error loading workspace settings.",
        );
    });

    it("transitions to forbidden state on 403", async () => {
        const err = new UnexpectedResponseError("Forbidden", 403, {});
        const backend = mockBackend(vi.fn().mockRejectedValue(err));

        const { result } = renderHook(() => useWorkspaceSettings(backend, "ws-123"));

        await waitFor(() => expect(result.current.state).toBe("forbidden"));
    });

    it("transitions to forbidden state on 404 (Tiger omits workspace existence)", async () => {
        const err = new UnexpectedResponseError("Not Found", 404, {});
        const backend = mockBackend(vi.fn().mockRejectedValue(err));

        const { result } = renderHook(() => useWorkspaceSettings(backend, "ws-123"));

        await waitFor(() => expect(result.current.state).toBe("forbidden"));
    });

    it("transitions to error state on other HTTP errors (e.g. 500)", async () => {
        const err = new UnexpectedResponseError("Internal Server Error", 500, {});
        const backend = mockBackend(vi.fn().mockRejectedValue(err));

        const { result } = renderHook(() => useWorkspaceSettings(backend, "ws-123"));

        await waitFor(() => expect(result.current.state).toBe("error"));
    });

    it("does not update state after unmount (no setState on cancelled fetch)", async () => {
        let resolveSettings!: (s: IUserWorkspaceSettings) => void;
        const slowFetch = vi.fn<() => Promise<IUserWorkspaceSettings>>(
            () =>
                new Promise((resolve) => {
                    resolveSettings = resolve;
                }),
        );
        const backend = mockBackend(slowFetch);

        const { result, unmount } = renderHook(() => useWorkspaceSettings(backend, "ws-123"));

        expect(result.current.state).toBe("loading");
        unmount();

        resolveSettings(stubSettings);
    });

    it("ignores stale result when workspaceId changes before the first fetch resolves", async () => {
        let resolveFirst!: (s: IUserWorkspaceSettings) => void;
        let fetchCallCount = 0;

        const fetcher = vi.fn<() => Promise<IUserWorkspaceSettings>>(() => {
            fetchCallCount++;
            if (fetchCallCount === 1) {
                return new Promise((resolve) => {
                    resolveFirst = resolve;
                });
            }
            return Promise.resolve(stubSettings);
        });
        const backend = mockBackend(fetcher);

        const { result, rerender } = renderHook(
            ({ wid }: { wid: string }) => useWorkspaceSettings(backend, wid),
            { initialProps: { wid: "ws-first" } },
        );

        expect(result.current.state).toBe("loading");

        rerender({ wid: "ws-second" });

        await waitFor(() => expect(result.current.state).toBe("ready"));

        resolveFirst(stubSettings);

        expect(result.current.state).toBe("ready");
    });

    it("returns the same idle object reference across re-renders (no churn)", () => {
        const { result, rerender } = renderHook(() => useWorkspaceSettings(undefined, undefined));

        const firstRef = result.current;
        rerender();

        expect(result.current).toBe(firstRef);
    });
});
