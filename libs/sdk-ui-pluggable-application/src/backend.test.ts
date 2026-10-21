// (C) 2026 GoodData Corporation

import { describe, expect, it, vi } from "vitest";

import { type CacheControl } from "@gooddata/sdk-backend-base";

import { createBackendForModule } from "./backend.js";

describe("createBackendForModule", () => {
    it("hands the cache control of the backend to onCacheReady", () => {
        const onCacheReady = vi.fn<(cacheControl: CacheControl) => void>();

        createBackendForModule({ type: "contextDeferred" }, { packageName: "test-module", onCacheReady });

        expect(onCacheReady).toHaveBeenCalledOnce();
        expect(onCacheReady.mock.calls[0][0]).toEqual(
            expect.objectContaining({ resetAll: expect.any(Function), resetCatalogs: expect.any(Function) }),
        );
    });
});
