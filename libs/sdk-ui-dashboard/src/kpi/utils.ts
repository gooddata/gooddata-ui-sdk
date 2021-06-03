// (C) 2020-2021 GoodData Corporation
import isNil from "lodash/isNil";
import isNumber from "lodash/isNumber";
import { IDataSeries } from "@gooddata/sdk-ui";
/**
 * @internal
 */
export function getKpiSeriesResult(series: IDataSeries | undefined): number | null {
    if (!series) {
        return null;
    }

    const value = series.dataPoints()[0].rawValue;

    if (isNil(value)) {
        return null;
    }

    if (isNumber(value)) {
        return value;
    }

    return Number.parseFloat(value);
}
