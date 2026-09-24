// (C) 2026 GoodData Corporation

// @vitest-environment node

import { describe, expect, it } from "vitest";

import { type IInsight, type IInsightWidget, idRef } from "@gooddata/sdk-model";

import { insightWidgetDescription } from "./insightWidgetDescription.js";

const insight = {
    insight: { ref: idRef("insight-1", "insight"), summary: "From the insight" },
} as IInsight;

const widget = (source?: "widget" | "insight"): IInsightWidget =>
    ({
        type: "insight",
        ref: idRef("w-1"),
        insight: idRef("insight-1", "insight"),
        description: "From the widget",
        configuration: source ? { description: { source } } : undefined,
    }) as IInsightWidget;

describe("insightWidgetDescription", () => {
    it("takes the widget's own description where the widget is the source", () => {
        expect(insightWidgetDescription(widget("widget"), insight)).toEqual("From the widget");
    });

    it("takes the insight's summary where the insight is the source", () => {
        expect(insightWidgetDescription(widget("insight"), insight)).toEqual("From the insight");
    });

    it("inherits from the insight when no source is configured", () => {
        expect(insightWidgetDescription(widget(), insight)).toEqual("From the insight");
    });

    it("keeps the widget's description where the insight is unavailable", () => {
        expect(insightWidgetDescription(widget("insight"), undefined)).toEqual("From the widget");
    });
});
