// (C) 2026 GoodData Corporation

import { type IInsight, type IInsightWidget } from "@gooddata/sdk-model";

/**
 * The description an insight widget shows: its own where it is configured as the source or where
 * the insight is not available, the insight's summary otherwise.
 *
 * @internal
 */
export function insightWidgetDescription(
    widget: IInsightWidget,
    insight: IInsight | undefined,
): string | undefined {
    return widget.configuration?.description?.source === "widget" || !insight
        ? widget.description
        : insight.insight.summary;
}
