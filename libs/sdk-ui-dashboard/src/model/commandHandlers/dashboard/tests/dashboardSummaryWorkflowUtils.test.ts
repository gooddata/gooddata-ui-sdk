// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type IDashboardLayout, type IRichTextWidget, idRef } from "@gooddata/sdk-model";

import { DASHBOARD_SUMMARY_MACRO } from "../../../store/dashboardSummaryWorkflow/constants.js";
import { hasMacroInLayout, isDashboardSummaryWorkflowStatus } from "../dashboardSummaryWorkflowUtils.js";

function richTextWidget(content: string): IRichTextWidget {
    return {
        type: "richText",
        ref: idRef("rt"),
        uri: "/gdc/md/rt",
        identifier: "rt",
        title: "t",
        description: "d",
        ignoreDashboardFilters: [],
        drills: [],
        content,
    };
}

function layoutWithWidget(widget: unknown): IDashboardLayout<unknown> {
    return {
        type: "IDashboardLayout",
        sections: [
            {
                type: "IDashboardLayoutSection",
                items: [
                    {
                        type: "IDashboardLayoutItem",
                        size: { xl: { gridWidth: 12 } },
                        widget,
                    },
                ],
            },
        ],
    };
}

describe("dashboardSummaryWorkflowUtils", () => {
    describe("isDashboardSummaryWorkflowStatus", () => {
        it("accepts only the known statuses", () => {
            expect(isDashboardSummaryWorkflowStatus("RUNNING")).toBe(true);
            expect(isDashboardSummaryWorkflowStatus("COMPLETED")).toBe(true);
            expect(isDashboardSummaryWorkflowStatus("FAILED")).toBe(true);
            expect(isDashboardSummaryWorkflowStatus("CANCELLED")).toBe(true);
            expect(isDashboardSummaryWorkflowStatus("UNKNOWN")).toBe(false);
            expect(isDashboardSummaryWorkflowStatus(undefined)).toBe(false);
        });
    });

    describe("hasMacroInLayout", () => {
        it("returns true when macro is in root rich text widget", () => {
            const layout = layoutWithWidget(richTextWidget(`Hello ${DASHBOARD_SUMMARY_MACRO}`));
            expect(hasMacroInLayout(layout, DASHBOARD_SUMMARY_MACRO)).toBe(true);
        });

        it("returns true when macro is in nested layout rich text widget", () => {
            const nested = layoutWithWidget(richTextWidget(`Hello ${DASHBOARD_SUMMARY_MACRO}`));
            const layout = layoutWithWidget(nested);
            expect(hasMacroInLayout(layout, DASHBOARD_SUMMARY_MACRO)).toBe(true);
        });

        it("returns false when macro is not present", () => {
            const layout = layoutWithWidget(richTextWidget("Hello"));
            expect(hasMacroInLayout(layout, DASHBOARD_SUMMARY_MACRO)).toBe(false);
        });
    });
});
