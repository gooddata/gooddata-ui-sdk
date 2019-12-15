// (C) 2019 GoodData Corporation
import { DataViewFacade } from "@gooddata/sdk-backend-spi";
import { measureLocalId } from "@gooddata/sdk-model";
import { IChartConfig } from "../Config";
import { BucketNames } from "../../base";
import { VisType } from "../../base/constants/visualizationTypes";
import { isComboChart } from "./common";
import get = require("lodash/get");

export function setMeasuresToSecondaryAxis(config: IChartConfig = {}, dv: DataViewFacade): IChartConfig {
    const isDualAxis: boolean = get(config, "dualAxis", true);
    const type: VisType = get(config, "type");
    const { secondary_yaxis: secondaryYAxis, ...remainConfig } = config;
    const secondaryMeasuresIds = dv.bucketMeasures(BucketNames.SECONDARY_MEASURES).map(measureLocalId);

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
