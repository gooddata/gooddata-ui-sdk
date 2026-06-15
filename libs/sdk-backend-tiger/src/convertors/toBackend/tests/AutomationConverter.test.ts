// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type IAutomationAlert, type IInsightParameterValue, idRef, newMeasure } from "@gooddata/sdk-model";

import { convertAlert } from "../AutomationConverter.js";

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
