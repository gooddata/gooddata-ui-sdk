// (C) 2019 GoodData Corporation
import { DataViewFacade } from "@gooddata/sdk-backend-spi";
import { measureId } from "@gooddata/sdk-model";
import { IChartConfig } from "../interfaces/Config";
import { SECONDARY_MEASURES } from "../constants/bucketNames";
import { VisType } from "../constants/visualizationTypes";
import { isComboChart } from "./common";
import get = require("lodash/get");

export function setMeasuresToSecondaryAxis(config: IChartConfig = {}, dv: DataViewFacade): IChartConfig {
    const isDualAxis: boolean = get(config, "dualAxis", true);
    const type: VisType = get(config, "type");
    const { secondary_yaxis: secondaryYAxis, ...remainConfig } = config;
    const secondaryMeasuresIds = dv.bucketMeasures(SECONDARY_MEASURES).map(measureId);

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
