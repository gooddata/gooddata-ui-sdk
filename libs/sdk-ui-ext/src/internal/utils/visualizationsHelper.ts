// (C) 2019-2026 GoodData Corporation

import { type ChartType, VisualizationTypes } from "@gooddata/sdk-ui";

const openAsReportSupportingVisualizations: ChartType[] = [
    VisualizationTypes.COLUMN,
    VisualizationTypes.BAR,
    VisualizationTypes.LINE,
    VisualizationTypes.PIE,
];

export function isOpenAsReportSupportedByVisualization(type: ChartType): boolean {
    return openAsReportSupportingVisualizations.includes(type);
}
