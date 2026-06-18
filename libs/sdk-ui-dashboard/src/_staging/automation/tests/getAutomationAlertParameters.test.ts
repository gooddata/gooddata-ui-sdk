// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import {
    type IAutomationMetadataObjectDefinition,
    type IInsightParameterValue,
    idRef,
} from "@gooddata/sdk-model";

import { getAutomationAlertParameters } from "../index.js";

function alertAutomation(
    parameters: IInsightParameterValue[] | undefined,
): IAutomationMetadataObjectDefinition {
    return {
        type: "automation",
        title: "Alert",
        alert: {
            condition: { type: "comparison", operator: "GREATER_THAN", right: 1, left: { id: "m1" } },
            execution: { attributes: [], measures: [], filters: [], parameters },
            trigger: { state: "ACTIVE" },
        },
    };
}

describe("getAutomationAlertParameters", () => {
    it("returns the alert execution parameters", () => {
        const parameters: IInsightParameterValue[] = [{ ref: idRef("topN", "parameter"), value: 8 }];
        expect(getAutomationAlertParameters(alertAutomation(parameters))).toEqual(parameters);
    });

    it("returns undefined when the automation has no alert", () => {
        expect(getAutomationAlertParameters({ type: "automation", title: "Schedule" })).toBeUndefined();
    });

    it("returns undefined for an undefined automation", () => {
        expect(getAutomationAlertParameters(undefined)).toBeUndefined();
    });
});
