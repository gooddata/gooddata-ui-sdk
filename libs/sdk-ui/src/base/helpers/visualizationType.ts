// (C) 2007-2019 GoodData Corporation
import { VisualizationTypes, ChartType } from "../constants/visualizationTypes";

export function getVisualizationType(type: ChartType): ChartType {
    if (type === VisualizationTypes.COMBO2) {
        return VisualizationTypes.COMBO;
    }

    return type;
}
