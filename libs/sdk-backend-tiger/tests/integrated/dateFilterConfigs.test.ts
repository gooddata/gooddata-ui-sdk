// (C) 2022-2025 GoodData Corporation
import { beforeAll, describe, expect, it } from "vitest";

import { testBackend, testWorkspace } from "./backend.js";
const backend = testBackend();

beforeAll(async () => {
    await backend.authenticate(true);
});

describe("tiger dateFilterConfigs", () => {
    it("should load date filter configs", async () => {
        const result = await backend
            .workspace(testWorkspace())
            .dateFilterConfigs()
            .withOffset(0)
            .withLimit(10)
            .query();

        expect(result).toMatchSnapshot();
    });

    it("should load empty date filter configs for out-of-range page", async () => {
        const result = await backend
            .workspace(testWorkspace())
            .dateFilterConfigs()
            .withOffset(0)
            .withLimit(10)
            .query();

        const page = await result.goTo(4);
        expect(page).toMatchSnapshot();
    });
});
