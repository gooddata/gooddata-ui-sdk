// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { getUIPath } from "../getUIPath.js";

describe("getUIPath", () => {
    it("returns legacy metric editor path by default", () => {
        expect(getUIPath("metric", "metric-id", "workspace-id")).toBe(
            "/metrics/#/workspace-id/metric/metric-id",
        );
    });

    it("returns hosted metric editor path when enabled", () => {
        expect(
            getUIPath("metric", "metric-id", "workspace-id", undefined, {
                useHostedMetricEditor: true,
            }),
        ).toBe("/workspace/workspace-id/metrics/metric/metric-id");
    });
});
