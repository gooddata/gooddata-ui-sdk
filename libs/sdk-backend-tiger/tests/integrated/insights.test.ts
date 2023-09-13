// (C) 2022 GoodData Corporation
import { describe, beforeAll, expect, it } from "vitest";
import { testBackend, testWorkspace, doSanitizeCommon } from "./backend.js";
const backend = testBackend();

beforeAll(async () => {
    await backend.authenticate(true);
});

describe("tiger insights", () => {
    it("should load insights", async () => {
        const result = await backend.workspace(testWorkspace()).insights().getInsights();
        const sanitizeResult = doSanitizeCommon(result);
        expect(sanitizeResult).toMatchSnapshot();
    });

    it("should load empty insights for out-of-range page", async () => {
        const result = await backend.workspace(testWorkspace()).insights().getInsights();
        const page = await result.goTo(4);
        const sanitizeResult = doSanitizeCommon(page);
        expect(sanitizeResult).toMatchSnapshot();
    });
});
