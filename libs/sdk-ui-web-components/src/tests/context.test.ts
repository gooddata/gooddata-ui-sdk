// (C) 2022 GoodData Corporation
import { CustomElementContext } from "../context";

describe("context", () => {
    // Use enforced type casting for test simplicity
    const mockContext = { backend: "test", workspaceId: "test" } as unknown as CustomElementContext;

    beforeEach(() => {
        // Have to re-import and reset modules for each test,
        //  as context can be set only once
        jest.resetModules();
    });

    it("should allow subscribing to the context before it is set", async () => {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const { getContext, setContext } = require("../context");

        const contextPromise = getContext();
        setContext(mockContext);

        await expect(contextPromise).resolves.toBe(mockContext);
    });

    it("should allow subscribing to the context after it is set", async () => {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const { getContext, setContext } = require("../context");

        setContext(mockContext);
        const contextPromise = getContext();

        await expect(contextPromise).resolves.toBe(mockContext);
    });
});
