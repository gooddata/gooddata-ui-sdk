// (C) 2021 GoodData Corporation

import {
    IDashboardLayout,
    IDashboardLayoutItem,
    IDashboardWidget,
    ISettings,
    isInsightWidget,
    isKpiWidget,
    WidgetType,
} from "@gooddata/sdk-backend-spi";
import { IInsight, insightRef, serializeObjRef } from "@gooddata/sdk-model";
import compact from "lodash/compact";
import keyBy from "lodash/keyBy";
import { InvariantError } from "ts-invariant";
import {
    MeasurableWidgetContent,
    validateDashboardLayoutWidgetSize,
} from "../../layout/DefaultDashboardLayoutRenderer";

function extractContentFromWidget(
    widget: IDashboardWidget,
    insightsById: Record<string, IInsight>,
): { type: WidgetType; content?: MeasurableWidgetContent } {
    if (isInsightWidget(widget)) {
        const insightRef = widget.insight;

        return {
            type: "insight",
            content: insightsById[serializeObjRef(insightRef)],
        };
    } else if (isKpiWidget(widget)) {
        return {
            type: "kpi",
            content: widget.kpi,
        };
    }

    throw new InvariantError(`trying to extract content from unknown widget type ${widget.type}`);
}

/**
 * Sanitizes item. At this moment this function will ensure that Insight and KPI widgets conform to the sizing prescriptions.
 *
 * @param item - item in layout section
 * @param insightsById - list of insights available; insight widgets will be resolved using this
 * @param settings - settings that may impact the sizing
 */
function dashboardLayoutItemSanitize(
    item: IDashboardLayoutItem,
    insightsById: Record<string, IInsight>,
    settings: ISettings,
): IDashboardLayoutItem | undefined {
    const {
        widget,
        size: { xl },
    } = item;

    // only sanitize known widget types
    if (!isInsightWidget(widget) || !isKpiWidget(widget)) {
        return item;
    }

    const { type, content } = extractContentFromWidget(widget, insightsById);

    // if the dashboard is inconsistent (can ultimately happen on tiger), then return no item => it will be removed
    if (!content) {
        return;
    }

    const { validWidth, validHeight } = validateDashboardLayoutWidgetSize(
        xl.gridWidth,
        xl.gridHeight,
        type,
        content,
        settings,
    );

    return {
        ...item,
        size: {
            xl: {
                ...xl,
                gridWidth: validWidth,
                gridHeight: validHeight,
            },
        },
    };
}

/**
 * This function sanitizes dashboard layout. It will:
 *
 * 1.  Ensure insight widgets have correct sizes - matching what the visualization used by the insight needs
 *     (this is essential as the insight visualization may change since the last time dashboard was created)
 * 2.  Ensure insight widgets reference existing insights.
 *
 * @param layout - layout
 * @param insights - existing insights that are referenced by the layout's widgets
 * @param settings - current settings; these may influence sizing of the widgets
 */
export function dashboardLayoutSanitize(
    layout: IDashboardLayout,
    insights: IInsight[],
    settings: ISettings,
): IDashboardLayout {
    const insightsById: Record<string, IInsight> = keyBy(insights, (insight) =>
        serializeObjRef(insightRef(insight)),
    );
    const sanitizedSections = layout.sections.map((section) => {
        const sanitizedItems = compact(
            section.items.map((item) => dashboardLayoutItemSanitize(item, insightsById, settings)),
        );

        return {
            ...section,
            items: sanitizedItems,
        };
    });

    return {
        ...layout,
        sections: sanitizedSections,
    };
}
