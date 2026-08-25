// (C) 2026 GoodData Corporation

// @vitest-environment node

import { describe, expect, it, vi } from "vitest";

import { UnexpectedResponseError, type IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { type IWorkspacePermissions } from "@gooddata/sdk-model";

import { classifyWorkspaceAccessError, getWorkspaceAccess } from "./workspaceAccess.js";

function mockBackend(fetcher: () => Promise<IWorkspacePermissions>): IAnalyticalBackend {
    return {
        workspace: () => ({ permissions: () => ({ getPermissionsForCurrentUser: fetcher }) }),
    } as unknown as IAnalyticalBackend;
}

describe("classifyWorkspaceAccessError", () => {
    it.each([403, 404])("treats HTTP %s as forbidden", (httpStatus) => {
        // Tiger answers 404, with the same message as 403, to avoid leaking workspace existence
        expect(classifyWorkspaceAccessError(new UnexpectedResponseError("nope", httpStatus, {}))).toBe(
            "forbidden",
        );
    });

    it.each([500, 502, 401])("treats HTTP %s as unknown", (httpStatus) => {
        expect(classifyWorkspaceAccessError(new UnexpectedResponseError("boom", httpStatus, {}))).toBe(
            "unknown",
        );
    });

    it("treats a non-response error (e.g. offline) as unknown", () => {
        expect(classifyWorkspaceAccessError(new Error("Failed to fetch"))).toBe("unknown");
    });

    it("treats a thrown non-Error as unknown", () => {
        expect(classifyWorkspaceAccessError("boom")).toBe("unknown");
    });
});

describe("getWorkspaceAccess", () => {
    it("resolves accessible when the permissions request succeeds", async () => {
        const backend = mockBackend(vi.fn().mockResolvedValue({} as IWorkspacePermissions));
        await expect(getWorkspaceAccess(backend, "ws-123")).resolves.toBe("accessible");
    });

    it("resolves forbidden on 403", async () => {
        const backend = mockBackend(
            vi.fn().mockRejectedValue(new UnexpectedResponseError("Forbidden", 403, {})),
        );
        await expect(getWorkspaceAccess(backend, "ws-123")).resolves.toBe("forbidden");
    });

    it("resolves unknown when the check itself fails", async () => {
        const backend = mockBackend(vi.fn().mockRejectedValue(new Error("Failed to fetch")));
        await expect(getWorkspaceAccess(backend, "ws-123")).resolves.toBe("unknown");
    });
});
