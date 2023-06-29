// (C) 2020 GoodData Corporation

import { testBackend, testWorkspace } from "./backend.js";
import { describe, expect, it, beforeAll } from "vitest";
const backend = testBackend();

beforeAll(async () => {
    await backend.authenticate(true);
});

describe("bear insights", () => {
    it("should load insights", async () => {
        const result = await backend.workspace(testWorkspace()).insights().getInsights();

        expect(result).toMatchSnapshot();
    });

    it("should load empty insights for out-of-range page", async () => {
        const result = await backend.workspace(testWorkspace()).insights().getInsights();

        const page = await result.goTo(4);
        expect(page).toMatchSnapshot();
    });
});
