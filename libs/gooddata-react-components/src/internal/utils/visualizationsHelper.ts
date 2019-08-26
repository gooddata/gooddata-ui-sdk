// (C) 2019 GoodData Corporation
import includes = require("lodash/includes");
import { ChartType, VisualizationTypes } from "../../constants/visualizationTypes";

const openAsReportSupportingVisualizations: ChartType[] = [
    VisualizationTypes.COLUMN,
    VisualizationTypes.BAR,
    VisualizationTypes.LINE,
    VisualizationTypes.PIE,
];

export function isOpenAsReportSupportedByVisualization(type: ChartType) {
    return includes(openAsReportSupportingVisualizations, type);
}
