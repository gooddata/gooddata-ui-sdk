// (C) 2026 GoodData Corporation

// @vitest-environment node

import { describe, expect, it } from "vitest";

import { type AlertMetric } from "../types.js";

import { createDefaultAlert } from "./utils/convertors.js";

const metric: AlertMetric = {
    measure: {
        measure: {
            localIdentifier: "localMetric1",
            title: "metric1",
            definition: {
                measureDefinition: {
                    filters: [],
                    item: {
                        type: "measure",
                        identifier: "simple_metric_1",
                    },
                },
            },
        },
    },
    isPrimary: true,
    comparators: [],
};

function createAlert(executionTimezone?: string) {
    return createDefaultAlert(
        [],
        [metric],
        metric,
        "channel-1",
        { type: "user", id: "user-1" },
        {},
        "GREATER_THAN",
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        executionTimezone,
    );
}

describe("createDefaultAlert — execution timezone", () => {
    it("bakes a dashboard-scoped timezone into the execution config", () => {
        const alert = createAlert("Europe/Prague");

        expect(alert?.alert?.execution.executionConfig).toEqual({ timezone: "Europe/Prague" });
    });

    it("leaves the execution config out when no timezone is provided (settings hierarchy)", () => {
        const alert = createAlert(undefined);

        expect(alert?.alert?.execution.executionConfig).toBeUndefined();
    });
});
