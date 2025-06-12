// (C) 2022-2023 GoodData Corporation
import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";
import { beforeEach, describe, expect, it, vi } from "vitest";

describe("context", () => {
    const mockContext = { backend: dummyBackend(), workspaceId: "test" };

    beforeEach(() => {
        // Have to re-import and reset modules for each test,
        //  as context can be set only once
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
});
