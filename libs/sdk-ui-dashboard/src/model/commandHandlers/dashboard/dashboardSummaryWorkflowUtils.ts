// (C) 2026 GoodData Corporation

import { type DashboardSummaryWorkflowStatus } from "@gooddata/sdk-backend-spi";
import { type IDashboardLayout, isDashboardLayout, isRichTextWidget } from "@gooddata/sdk-model";

/**
 * @internal
 */
export function isDashboardSummaryWorkflowStatus(status: unknown): status is DashboardSummaryWorkflowStatus {
    return status === "RUNNING" || status === "COMPLETED" || status === "FAILED" || status === "CANCELLED";
}

/**
 * @internal
 */
export function hasMacroInLayout<TWidget>(
    layout: IDashboardLayout<TWidget> | undefined,
    macro: string,
): boolean {
    if (!layout) {
        return false;
    }

    for (const section of layout.sections) {
        for (const item of section.items) {
            const widget = item.widget;

            if (isRichTextWidget(widget) && (widget.content ?? "").includes(macro)) {
                return true;
            }

            if (isDashboardLayout(widget) && hasMacroInLayout(widget, macro)) {
                return true;
            }
        }
    }

    return false;
}
