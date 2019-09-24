// (C) 2019 GoodData Corporation
import { DataViewFacade } from "@gooddata/sdk-backend-spi";
import { VisualizationObject } from "@gooddata/gd-bear-model";
import { SECONDARY_MEASURES } from "../constants/bucketNames";
import get = require("lodash/get");
import { IChartConfig, INewChartConfig } from "../../interfaces/Config";
import { getSecondaryMeasuresLocalIdentifiers } from "./mdObjBucketHelper";
import { isComboChart } from "./common";
import { VisType } from "../constants/visualizationTypes";

export function setMeasuresToSecondaryAxis(config: IChartConfig = {}): IChartConfig {
    const isDualAxis: boolean = get(config, "dualAxis", true);
    const type: VisType = get(config, "type");
    const { secondary_yaxis: secondaryYAxis, ...remainConfig } = config;
    const buckets: VisualizationObject.IBucket[] = get(config, "mdObject.buckets");
    const secondaryIdentifierMeasures: string[] = getSecondaryMeasuresLocalIdentifiers(buckets);

    if (!isComboChart(type)) {
        return config;
    }

    if (!isDualAxis) {
        return remainConfig;
    }

    return {
        ...remainConfig,
        secondary_yaxis: {
            ...secondaryYAxis,
            measures: secondaryIdentifierMeasures,
        },
    };
}

export function setMeasuresToSecondaryAxis2(
    config: INewChartConfig = {},
    dv: DataViewFacade,
): INewChartConfig {
    const isDualAxis: boolean = get(config, "dualAxis", true);
    const type: VisType = get(config, "type");
    const { secondary_yaxis: secondaryYAxis, ...remainConfig } = config;
    const secondaryMeasuresIds = dv.bucketMeasures(SECONDARY_MEASURES).map(m => m.measure.localIdentifier);

    if (!isComboChart(type)) {
        return config;
    }

    if (!isDualAxis) {
        return remainConfig;
    }

    return {
        ...remainConfig,
        secondary_yaxis: {
            ...secondaryYAxis,
            measures: secondaryMeasuresIds,
        },
    };
}
