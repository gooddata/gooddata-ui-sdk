// (C) 2022-2026 GoodData Corporation

import { beforeEach, describe, expect, it, vi } from "vitest";

import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";

describe("context", () => {
    const mockContext = { backend: dummyBackend(), workspaceId: "test" };
    const replacementContext = { backend: dummyBackend(), workspaceId: "replacement" };

    beforeEach(() => {
        // Have to re-import and reset modules for each test,
        //  to keep each test isolated
        vi.resetModules();
    });

    it("should allow subscribing to the context before it is set", async () => {
        const { getContext, setContext } = await import("../context.js");

        const contextPromise = getContext();
        setContext(mockContext);

        await expect(contextPromise).resolves.toBe(mockContext);
    });

    it("should allow subscribing to the context after it is set", async () => {
        const { getContext, setContext } = await import("../context.js");

        setContext(mockContext);
        const contextPromise = getContext();

        await expect(contextPromise).resolves.toBe(mockContext);
    });

    it("should expose the latest context snapshot after replacement", async () => {
        const { getContextSnapshot, setContext } = await import("../context.js");

        setContext(mockContext);
        setContext(replacementContext);

        expect(getContextSnapshot()).toBe(replacementContext);
    });

    it("should resolve getContext to the latest context for later subscribers", async () => {
        const { getContext, setContext } = await import("../context.js");

        setContext(mockContext);
        setContext(replacementContext);

        await expect(getContext()).resolves.toBe(replacementContext);
    });
});
