// (C) 2020 GoodData Corporation
import { IWidget } from "@gooddata/sdk-backend-spi";
import {
    IFilter,
    IMeasure,
    isAllTimeDateFilter,
    newMeasure,
    newPreviousPeriodMeasure,
} from "@gooddata/sdk-model";
import { InvariantError } from "ts-invariant";

export function getMeasures(
    kpiWidget: IWidget,
    filters?: IFilter[],
): { primaryMeasure: IMeasure; secondaryMeasure?: IMeasure } {
    if (!kpiWidget.kpi) {
        throw new InvariantError("The provided widget is not a KPI widget.");
    }

    const primaryMeasure = newMeasure(kpiWidget.kpi.metric);

    const comparison = kpiWidget.kpi.comparisonType;

    const isAllTime = !filters || filters.some(isAllTimeDateFilter);
    if (comparison === "none" || isAllTime) {
        return { primaryMeasure };
    }

    if (comparison === "previousPeriod") {
        const secondaryMeasure = newPreviousPeriodMeasure(primaryMeasure, [
            { dataSet: kpiWidget.dateDataSet, periodsAgo: 1 },
        ]);

        return { primaryMeasure, secondaryMeasure };
    }

    // TODO lastYear - we need date dataset info to get the year granularity attribute -> we need catalog
}
