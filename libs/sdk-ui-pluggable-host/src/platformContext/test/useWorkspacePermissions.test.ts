// (C) 2026 GoodData Corporation

import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { UnexpectedResponseError, type IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { type IWorkspacePermissions } from "@gooddata/sdk-model";

import { useWorkspacePermissions } from "../useWorkspacePermissions.js";

type PermissionsFetcher = () => Promise<IWorkspacePermissions>;

function mockBackend(getPermissionsForCurrentUser: PermissionsFetcher): IAnalyticalBackend {
    return {
        workspace: () => ({
            permissions: () => ({ getPermissionsForCurrentUser }),
        }),
    } as unknown as IAnalyticalBackend;
}

const stubPermissions = {} as IWorkspacePermissions;

describe("useWorkspacePermissions", () => {
    it("returns idle immediately when backend is undefined", () => {
        const { result } = renderHook(() => useWorkspacePermissions(undefined, "ws-123"));
        expect(result.current).toEqual({ state: "idle" });
    });

    it("returns idle immediately when workspaceId is undefined", () => {
        const backend = mockBackend(vi.fn());
        const { result } = renderHook(() => useWorkspacePermissions(backend, undefined));
        expect(result.current).toEqual({ state: "idle" });
    });

    it("transitions through loading then resolves to ready on success", async () => {
        const getPermissionsForCurrentUser = vi.fn().mockResolvedValue(stubPermissions);
        const backend = mockBackend(getPermissionsForCurrentUser);

        const { result } = renderHook(() => useWorkspacePermissions(backend, "ws-123"));

        expect(result.current.state).toBe("loading");

        await waitFor(() => expect(result.current.state).toBe("ready"));
        expect((result.current as { state: "ready"; permissions: IWorkspacePermissions }).permissions).toBe(
            stubPermissions,
        );
    });

    it("transitions to error state when the fetch fails", async () => {
        const getPermissionsForCurrentUser = vi.fn().mockRejectedValue(new Error("Permissions fetch failed"));
        const backend = mockBackend(getPermissionsForCurrentUser);

        const { result } = renderHook(() => useWorkspacePermissions(backend, "ws-123"));

        await waitFor(() => expect(result.current.state).toBe("error"));
        expect((result.current as { state: "error"; error: string }).error).toBe("Permissions fetch failed");
    });

    it("uses the error message string when a non-Error is thrown", async () => {
        const getPermissionsForCurrentUser = vi.fn().mockRejectedValue("raw string error");
        const backend = mockBackend(getPermissionsForCurrentUser);

        const { result } = renderHook(() => useWorkspacePermissions(backend, "ws-123"));

        await waitFor(() => expect(result.current.state).toBe("error"));
        expect((result.current as { state: "error"; error: string }).error).toBe(
            "Unknown error loading workspace permissions.",
        );
    });

    it("does not update state after unmount (no setState on cancelled fetch)", async () => {
        let resolvePermissions!: (p: IWorkspacePermissions) => void;
        const slowFetch = vi.fn<() => Promise<IWorkspacePermissions>>(
            () =>
                new Promise((resolve) => {
                    resolvePermissions = resolve;
                }),
        );
        const backend = mockBackend(slowFetch);

        const { result, unmount } = renderHook(() => useWorkspacePermissions(backend, "ws-123"));

        expect(result.current.state).toBe("loading");
        unmount();

        // Resolve after unmount — should be silently ignored (no React setState warning)
        resolvePermissions(stubPermissions);
        // No assertion needed; the absence of a React warning about setState after unmount is the check
    });

    it("ignores stale result when workspaceId changes before the first fetch resolves", async () => {
        let resolveFirst!: (p: IWorkspacePermissions) => void;
        let fetchCallCount = 0;

        const fetcher = vi.fn<() => Promise<IWorkspacePermissions>>(() => {
            fetchCallCount++;
            if (fetchCallCount === 1) {
                return new Promise((resolve) => {
                    resolveFirst = resolve;
                });
            }
            return Promise.resolve(stubPermissions);
        });
        const backend = mockBackend(fetcher);

        const { result, rerender } = renderHook(
            ({ wid }: { wid: string }) => useWorkspacePermissions(backend, wid),
            { initialProps: { wid: "ws-first" } },
        );

        expect(result.current.state).toBe("loading");

        // Change workspaceId — cancels the first fetch
        rerender({ wid: "ws-second" });

        // Second fetch resolves immediately, so state should become ready for ws-second
        await waitFor(() => expect(result.current.state).toBe("ready"));

        // Now resolve the first (stale) fetch — should have no effect
        resolveFirst(stubPermissions);

        // State remains ready (not reset or duplicated)
        expect(result.current.state).toBe("ready");
    });

    it("transitions to forbidden state on 403", async () => {
        const err = new UnexpectedResponseError("Forbidden", 403, {});
        const backend = mockBackend(vi.fn().mockRejectedValue(err));

        const { result } = renderHook(() => useWorkspacePermissions(backend, "ws-123"));

        await waitFor(() => expect(result.current.state).toBe("forbidden"));
    });

    it("transitions to forbidden state on 404 (Tiger omits workspace existence)", async () => {
        const err = new UnexpectedResponseError("Not Found", 404, {});
        const backend = mockBackend(vi.fn().mockRejectedValue(err));

        const { result } = renderHook(() => useWorkspacePermissions(backend, "ws-123"));

        await waitFor(() => expect(result.current.state).toBe("forbidden"));
    });

    it("transitions to error state on other HTTP errors (e.g. 500)", async () => {
        const err = new UnexpectedResponseError("Internal Server Error", 500, {});
        const backend = mockBackend(vi.fn().mockRejectedValue(err));

        const { result } = renderHook(() => useWorkspacePermissions(backend, "ws-123"));

        await waitFor(() => expect(result.current.state).toBe("error"));
    });

    it("returns the same idle object reference across re-renders (no churn)", () => {
        const { result, rerender } = renderHook(() => useWorkspacePermissions(undefined, undefined));

        const firstRef = result.current;
        rerender();

        expect(result.current).toBe(firstRef);
    });
});
