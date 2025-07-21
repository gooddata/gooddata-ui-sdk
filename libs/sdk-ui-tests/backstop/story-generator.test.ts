// (C) 2022-2025 GoodData Corporation
// @vitest-environment node
import { describe, it, expect } from "vitest";

import "./mockWindow";

import "../stories/_infra/generateInsightStories";
import "../stories/_infra/generateScenarioStories";

describe("story-generator", () => {
    it("generates stories", async () => {
        expect(1).toEqual(1);
    });
});
