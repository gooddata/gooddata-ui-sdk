// (C) 2019-2020 GoodData Corporation
import includes from "lodash/includes";
import { ChartType, VisualizationTypes } from "@gooddata/sdk-ui";

const openAsReportSupportingVisualizations: ChartType[] = [
    VisualizationTypes.COLUMN,
    VisualizationTypes.BAR,
    VisualizationTypes.LINE,
    VisualizationTypes.PIE,
];

export function isOpenAsReportSupportedByVisualization(type: ChartType) {
    return includes(openAsReportSupportingVisualizations, type);
}
