// (C) 2019-2020 GoodData Corporation
import { measureLocalId } from "@gooddata/sdk-model";
import { IChartConfig } from "../../../interfaces";
import { BucketNames, VisType, DataViewFacade } from "@gooddata/sdk-ui";
import { isComboChart } from "./common";
import get from "lodash/get";

export function setMeasuresToSecondaryAxis(config: IChartConfig = {}, dv: DataViewFacade): IChartConfig {
    const isDualAxis: boolean = get(config, "dualAxis", true);
    const type: VisType = get(config, "type");
    const { secondary_yaxis: secondaryYAxis, ...remainConfig } = config;
    const secondaryMeasuresIds = dv.def().bucketMeasures(BucketNames.SECONDARY_MEASURES).map(measureLocalId);

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
