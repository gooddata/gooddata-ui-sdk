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
export const useSectionExportData = (depth: number): SectionExportData | undefined => {
    const isExportMode = useDashboardSelector(selectIsInExportMode);

    if (!isExportMode) {
        return undefined;
    }

    if (depth === 0) {
        return {
            info: { "data-export-type": "section-info", "data-export-depth": depth.toString() },
            section: { "data-export-type": "section" },
            title: { "data-export-type": "section-title" },
            description: {
                description: { "data-export-type": "section-description" },
                richText: {
                    markdown: { "data-export-content-type": "markdown" },
                },
            },
        };
    }

    return {
        info: { "data-export-type": "section-info", "data-export-depth": depth.toString() },
        title: { "data-export-type": "section-title" },
        description: {
            description: { "data-export-type": "section-description" },
            richText: {
                markdown: { "data-export-content-type": "markdown" },
            },
        },
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
        description: {
            description: { "data-export-type": "widget-description" },
            richText: {
                markdown: { "data-export-content-type": "markdown" },
            },
        },
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
