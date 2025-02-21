// (C) 2025 GoodData Corporation

import { insightVisualizationType } from "@gooddata/sdk-model";
import { useMemo } from "react";
import {
    ExtendedDashboardWidget,
    selectInsightByWidgetRef,
    selectIsInExportMode,
    useDashboardSelector,
} from "../../model/index.js";
import {
    RichTextExportData,
    SectionExportData,
    WidgetExportData,
    WidgetExportDataAttributes,
} from "./types.js";

/**
 * @alpha
 */
export const useSectionExportData = (firstLevel: boolean): SectionExportData | undefined => {
    const isExportMode = useDashboardSelector(selectIsInExportMode);

    if (!isExportMode) {
        return undefined;
    }

    if (firstLevel) {
        return {
            section: { "data-export-type": "section" },
            title: { "data-export-type": "section-title" },
            description: { "data-export-type": "section-description" },
        };
    }

    return {
        title: { "data-export-type": "section-title" },
        description: { "data-export-type": "section-description" },
    };
};

/**
 * @alpha
 */
export const useWidgetExportData = (widget: ExtendedDashboardWidget): WidgetExportData | undefined => {
    const insight = useDashboardSelector(selectInsightByWidgetRef(widget.ref));
    const isExportMode = useDashboardSelector(selectIsInExportMode);

    if (!isExportMode) {
        return undefined;
    }

    return {
        section: { "data-export-type": "widget" },
        widget: {
            "data-export-type": "widget-content",
            "data-export-widget-type": widget.type,
            ...(insight ? { "data-export-visualization-type": insightVisualizationType(insight) } : {}),
        },
        title: { "data-export-type": "widget-title" },
        description: { "data-export-type": "widget-description" },
    };
};

/**
 * @alpha
 */
export const useRichTextExportData = (): RichTextExportData | undefined => {
    const isExportMode = useDashboardSelector(selectIsInExportMode);

    if (!isExportMode) {
        return undefined;
    }

    return {
        markdown: { "data-export-content-type": "markdown" },
    };
};

/**
 * @alpha
 */
export const useVisualizationExportData = (
    widget: WidgetExportDataAttributes | undefined,
    loading: boolean,
    error: boolean,
): Partial<WidgetExportDataAttributes> | undefined => {
    const isExportMode = useDashboardSelector(selectIsInExportMode);

    return useMemo(() => {
        if (!isExportMode) {
            return undefined;
        }

        return {
            ...widget,
            "data-export-visualization-status": loading ? "loading" : error ? "error" : "loaded",
        };
    }, [widget, isExportMode, loading, error]);
};
