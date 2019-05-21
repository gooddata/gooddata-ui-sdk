// (C) 2007-2019 GoodData Corporation
import isArray = require("lodash/isArray");
import get = require("lodash/get");
import { AFM, VisualizationObject } from "@gooddata/typings";
import { VIEW_BY_ATTRIBUTES_LIMIT } from "../../components/visualizations/chart/constants";
import { IChartConfig } from "../../interfaces/Config";
import IVisualizationAttribute = VisualizationObject.IVisualizationAttribute;

export function getViewByTwoAttributes(
    viewBy: IVisualizationAttribute | IVisualizationAttribute[],
): IVisualizationAttribute[] {
    if (!viewBy) {
        return [];
    }
    if (viewBy && isArray(viewBy)) {
        // only get first two attributes
        return viewBy.slice(0, VIEW_BY_ATTRIBUTES_LIMIT);
    }
    return [viewBy] as VisualizationObject.IVisualizationAttribute[];
}

/**
 * Show a measure as a percentage
 * one measure
 *      => computeRatio = true (ignore stackBy)
 *      => computeRatio = false or not set => evaluate stackMeasuresToPercent
 * multiple measures
 *      => ignore computeRatio and use stackMeasuresToPercent
 *
 * stackMeasures is applied only when there are [2 measures and more]
 * stackMeasuresToPercent is applied only when there are [1 measure + 1 stackBy] or [2 measures and up]
 */
export function getSanitizedStackingConfig(
    afm: AFM.IAfm,
    chartConfig: IChartConfig,
    hasStackByAttribute: boolean,
): IChartConfig {
    const stackingConfig: IChartConfig = { ...chartConfig };
    if (get(afm, ["measures", "length"]) === 1) {
        const isComputeRatio = get(afm, ["measures", "0", "definition", "measure", "computeRatio"], false);
        if (isComputeRatio && stackingConfig.stackMeasures) {
            stackingConfig.stackMeasures = false;
        }
        if (isComputeRatio || !hasStackByAttribute) {
            if (stackingConfig.stackMeasuresToPercent) {
                stackingConfig.stackMeasuresToPercent = false;
            }
        }
    }
    return stackingConfig;
}
