// (C) 2019-2026 GoodData Corporation

import { measureLocalId } from "@gooddata/sdk-model";
import { BucketNames, type DataViewFacade } from "@gooddata/sdk-ui";

import { type IChartConfig } from "../../../interfaces/chartConfig.js";
import { isComboChart } from "../_util/common.js";

export function setMeasuresToSecondaryAxis(config: IChartConfig = {}, dv: DataViewFacade): IChartConfig {
    const isDualAxis = config.dualAxis ?? true;
    const type = config.type;
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
