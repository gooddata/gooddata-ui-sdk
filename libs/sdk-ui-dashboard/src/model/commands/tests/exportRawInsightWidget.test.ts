// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type IInsight, type IInsightWidget, idRef } from "@gooddata/sdk-model";

import { exportRawInsightWidget } from "../insight.js";

describe("exportRawInsightWidget", () => {
    const ref = idRef("widget");
    const widget = { identifier: "widget" } as IInsightWidget;
    const insight = {
        insight: {
            identifier: "insight",
            uri: "",
            ref: idRef("insight"),
            title: "",
            visualizationUrl: "",
            buckets: [],
            filters: [],
            sorts: [],
            properties: {},
        },
    } as IInsight;

    it("should keep the legacy correlationId overload working", () => {
        const command = exportRawInsightWidget(ref, widget, insight, "widget.csv", "correlation-id");

        expect(command.correlationId).toBe("correlation-id");
        expect(command.payload.options).toBeUndefined();
    });

    it("should include export options when provided", () => {
        const command = exportRawInsightWidget(
            ref,
            widget,
            insight,
            "widget.csv",
            { delimiter: ";", timeout: 10_000 },
            "correlation-id",
        );

        expect(command.correlationId).toBe("correlation-id");
        expect(command.payload.options).toEqual({ delimiter: ";", timeout: 10_000 });
    });
});
