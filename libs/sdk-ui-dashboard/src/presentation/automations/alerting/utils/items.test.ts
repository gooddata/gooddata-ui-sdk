// (C) 2026 GoodData Corporation

// @vitest-environment node

import { describe, expect, it } from "vitest";

import {
    type IAutomationAlertCondition,
    type IAutomationMetadataObject,
    idRef,
    measureItem,
    measureLocalId,
    newMeasure,
} from "@gooddata/sdk-model";

import { getSupportedInsightMeasuresByInsight } from "./items.js";

const METRIC_REF = idRef("fld_fraud_type_56_record_count", "measure");
const OPERAND = { id: "fraudType56RecordCount", title: "FLD Fraud Type 56 Record Count", format: "#,##0" };

const alertWith = (condition: IAutomationAlertCondition) =>
    ({
        alert: {
            condition,
            execution: {
                measures: [newMeasure(METRIC_REF, (m) => m.localId(OPERAND.id))],
                attributes: [],
                filters: [],
            },
        },
    }) as unknown as IAutomationMetadataObject;

describe("getSupportedInsightMeasuresByInsight without an insight", () => {
    it.each<[string, IAutomationAlertCondition]>([
        ["comparison", { type: "comparison", operator: "GREATER_THAN", left: OPERAND, right: 1 }],
        [
            "relative",
            {
                type: "relative",
                operator: "INCREASES_BY",
                measure: { operator: "CHANGE", left: OPERAND, right: { id: "previousPeriod" } },
                threshold: 10,
            },
        ],
        [
            "anomaly detection",
            {
                type: "anomalyDetection",
                measure: OPERAND,
                sensitivity: "MEDIUM",
                granularity: "DAY",
                dataset: idRef("date", "dataSet"),
            },
        ],
    ])("offers the alert's stored metric for the %s condition", (_type, condition) => {
        const [metric] = getSupportedInsightMeasuresByInsight(undefined, [], alertWith(condition));

        expect(measureLocalId(metric.measure)).toBe(OPERAND.id);
        expect(measureItem(metric.measure)).toEqual(METRIC_REF);
    });
});
