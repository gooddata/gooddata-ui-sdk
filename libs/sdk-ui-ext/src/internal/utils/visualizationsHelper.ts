// (C) 2019-2020 GoodData Corporation
import includes from "lodash/includes.js";
import { ChartType, VisualizationTypes } from "@gooddata/sdk-ui";

const openAsReportSupportingVisualizations: ChartType[] = [
    VisualizationTypes.COLUMN,
    VisualizationTypes.BAR,
    VisualizationTypes.LINE,
    VisualizationTypes.PIE,
];

export function isOpenAsReportSupportedByVisualization(type: ChartType): boolean {
    return includes(openAsReportSupportingVisualizations, type);
}
