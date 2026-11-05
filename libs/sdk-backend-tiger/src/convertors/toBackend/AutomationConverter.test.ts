// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import {
    type IAutomationAlert,
    type IAutomationMetadataObjectDefinition,
    type IInsightParameterValue,
    idRef,
    newMeasure,
} from "@gooddata/sdk-model";

import { convertAlert, convertAutomation } from "./AutomationConverter.js";

describe("convertAlert (toBackend) — parameters", () => {
    const baseAlert = (parameters?: IInsightParameterValue[]): IAutomationAlert => ({
        execution: {
            attributes: [],
            measures: [newMeasure(idRef("m1", "measure"), (m) => m.localId("m1"))],
            filters: [],
            ...(parameters ? { parameters } : {}),
        },
        condition: {
            type: "comparison",
            operator: "GREATER_THAN",
            left: { id: "m1" },
            right: 5,
        },
        trigger: { state: "ACTIVE", mode: "ALWAYS" },
    });

    it("threads execution.parameters into the AlertAfm parameters as ParameterItem[]", () => {
        const result = convertAlert(baseAlert([{ ref: idRef("topN", "parameter"), value: 5 }]));

        expect(result.execution.parameters).toEqual([
            { parameter: { identifier: { id: "topN", type: "parameter" } }, value: "5" },
        ]);
    });

    it("omits the parameters field when execution has none", () => {
        expect(convertAlert(baseAlert()).execution.parameters).toBeUndefined();
    });

    it("omits the parameters field for an empty parameters array", () => {
        expect(convertAlert(baseAlert([])).execution.parameters).toBeUndefined();
    });
});

describe("convertAlert (toBackend) — execution settings", () => {
    const baseAlert = (timezone?: string): IAutomationAlert => ({
        execution: {
            attributes: [],
            measures: [newMeasure(idRef("m1", "measure"), (m) => m.localId("m1"))],
            filters: [],
            ...(timezone ? { executionConfig: { timezone } } : {}),
        },
        condition: {
            type: "comparison",
            operator: "GREATER_THAN",
            left: { id: "m1" },
            right: 5,
        },
        trigger: { state: "ACTIVE", mode: "ALWAYS" },
    });

    it("maps execution.executionConfig.timezone to the alert settings", () => {
        expect(convertAlert(baseAlert("Europe/Prague")).settings).toEqual({ timezone: "Europe/Prague" });
    });

    it("omits settings when the execution has no timezone", () => {
        expect(convertAlert(baseAlert()).settings).toBeUndefined();
    });
});

describe("convertAutomation (toBackend) — state", () => {
    const schedule = (state?: "ACTIVE" | "PAUSED"): IAutomationMetadataObjectDefinition => ({
        type: "automation",
        title: "Weekly export",
        description: "",
        schedule: { cron: "0 0 * * * *", timezone: "UTC" },
        ...(state ? { state } : {}),
    });

    it("sends the state of a paused scheduled export", () => {
        expect(convertAutomation(schedule("PAUSED")).attributes?.state).toBe("PAUSED");
    });

    it("sends the state of an active scheduled export", () => {
        expect(convertAutomation(schedule("ACTIVE")).attributes?.state).toBe("ACTIVE");
    });

    it("omits the state of a new scheduled export", () => {
        expect(convertAutomation(schedule()).attributes).not.toHaveProperty("state");
    });
});
