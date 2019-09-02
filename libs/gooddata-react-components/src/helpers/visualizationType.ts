// (C) 2007-2019 GoodData Corporation
import get = require("lodash/get");
import { VisualizationClass } from "@gooddata/typings";
import { VisualizationTypes, VisType, ChartType } from "../constants/visualizationTypes";

export function getVisualizationTypeFromUrl(url: string): VisType {
    // known types follow local:<type> pattern
    const type = url.split(":")[1];
    if (type) {
        return VisualizationTypes[type.toUpperCase()];
    }

    return null;
}

export async function getVisualizationTypeFromVisualizationClass(
    visualizationClass: VisualizationClass.IVisualizationClass,
    getVisualizationTypeFromUrlImpl = getVisualizationTypeFromUrl,
): Promise<VisType> {
    return getVisualizationTypeFromUrlImpl(get(visualizationClass, ["content", "url"], ""));
}

export function getVisualizationType(type: ChartType): ChartType {
    if (type === VisualizationTypes.COMBO2) {
        return VisualizationTypes.COMBO;
    }

    return type;
}
