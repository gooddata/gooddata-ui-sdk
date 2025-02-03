// (C) 2025 GoodData Corporation

import { insightVisualizationType } from "@gooddata/sdk-model";
import {
    ExtendedDashboardWidget,
    selectInsightByWidgetRef,
    selectIsInExportMode,
    useDashboardSelector,
} from "../../model/index.js";
import { SectionExportData, WidgetExportData } from "./types.js";

/**
 * @alpha
 */
export const useSectionExportData = (firstLevel: boolean): SectionExportData | undefined => {
    const isExportMode = useDashboardSelector(selectIsInExportMode);

    if (!isExportMode || !firstLevel) {
        return undefined;
    }

    return {
        section: { "data-export-type": "section" },
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
