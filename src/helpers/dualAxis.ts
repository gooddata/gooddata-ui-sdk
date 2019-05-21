// (C) 2019 GoodData Corporation
import { VisualizationObject } from "@gooddata/typings";
import get = require("lodash/get");
import { IChartConfig } from "../interfaces/Config";

export function setMeasuresToSecondaryAxis(
    measures: VisualizationObject.IMeasure[],
    config: IChartConfig = {},
): IChartConfig {
    const isDualAxis = get(config, "dualAxis", true);
    const { secondary_yaxis: secondaryYAxis, ...remainConfig } = config;

    if (!isDualAxis) {
        return remainConfig;
    }

    const identifiers: string[] = measures.map((item: VisualizationObject.IMeasure) => {
        return get(item, "measure.localIdentifier", "");
    });

    return {
        ...remainConfig,
        secondary_yaxis: {
            ...secondaryYAxis,
            measures: identifiers,
        },
    };
}
