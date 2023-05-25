// (C) 2020-2022 GoodData Corporation
import {
    IMeasure,
    IPoPMeasureDefinition,
    IPreviousPeriodMeasureDefinition,
    isAllTimeDateFilter,
    isDateFilter,
    newMeasure,
    newPopMeasure,
    newPreviousPeriodMeasure,
    FilterContextItem,
    IKpiWidget,
    ICatalogDateDataset,
} from "@gooddata/sdk-model";
import { GoodDataSdkError, UnexpectedSdkError, UseCancelablePromiseState } from "@gooddata/sdk-ui";
import { invariant } from "ts-invariant";

import { filterContextItemsToDashboardFiltersByWidget } from "../../../../converters/index.js";
import { IDashboardFilter } from "../../../../types.js";
import { selectAllCatalogDateDatasetsMap, useDashboardSelector } from "../../../../model/index.js";
import { useWidgetFilters } from "../../common/index.js";
import { ObjRefMap } from "../../../../_staging/metadata/objRefMap.js";

interface IUseKpiDataConfig {
    kpiWidget?: IKpiWidget;
    dashboardFilters: FilterContextItem[];
}

interface IUseKpiDataResult {
    primaryMeasure: IMeasure;
    secondaryMeasure?: IMeasure<IPoPMeasureDefinition> | IMeasure<IPreviousPeriodMeasureDefinition>;
    effectiveFilters?: IDashboardFilter[];
    allFilters?: IDashboardFilter[];
}

/**
 * @internal
 */
export function useKpiData({
    kpiWidget,
    dashboardFilters,
}: IUseKpiDataConfig): UseCancelablePromiseState<IUseKpiDataResult, GoodDataSdkError> {
    const { status, result, error } = useWidgetFilters(kpiWidget);

    // we only put IDashboardFilters in, so we must get IDashboardFilters out as well
    const effectiveFilters = result as IDashboardFilter[] | undefined;

    const dateDatasetsMap = useDashboardSelector(selectAllCatalogDateDatasetsMap);

    if (!kpiWidget || status === "pending") {
        return {
            status: "pending",
            error: undefined,
            result: undefined,
        };
    }

    if (status === "error") {
        return {
            status: "error",
            error: error!,
            result: undefined,
        };
    }

    if (status === "rejected") {
        return {
            status: "error",
            error: new UnexpectedSdkError("Getting filter settings for a KPI widget failed."),
            result: undefined,
        };
    }

    if (status === "running") {
        return {
            status: "loading",
            error: undefined,
            result: undefined,
        };
    }

    const allFilters = filterContextItemsToDashboardFiltersByWidget(dashboardFilters, kpiWidget);
    const primaryMeasure = newMeasure(kpiWidget.kpi.metric);
    const secondaryMeasure = getSecondaryMeasure(
        kpiWidget,
        primaryMeasure,
        effectiveFilters,
        dateDatasetsMap,
    );

    return {
        status: "success",
        error: undefined,
        result: { primaryMeasure, secondaryMeasure, effectiveFilters, allFilters },
    };
}

function getSecondaryMeasure(
    kpiWidget: IKpiWidget,
    primaryMeasure: IMeasure,
    effectiveFilters: IDashboardFilter[] | undefined,
    dateDatasetsMap: ObjRefMap<ICatalogDateDataset>,
): IMeasure<IPoPMeasureDefinition> | IMeasure<IPreviousPeriodMeasureDefinition> | undefined {
    const comparison = kpiWidget.kpi.comparisonType;
    const isAllTime = !effectiveFilters?.some(
        (filter) => isDateFilter(filter) && !isAllTimeDateFilter(filter),
    );

    if (comparison === "none" || isAllTime || !kpiWidget.dateDataSet) {
        return undefined;
    }

    if (comparison === "previousPeriod") {
        return newPreviousPeriodMeasure(primaryMeasure, [{ dataSet: kpiWidget.dateDataSet, periodsAgo: 1 }]);
    }

    if (comparison === "lastYear") {
        const relevantDateDataset = dateDatasetsMap.get(kpiWidget.dateDataSet);

        invariant(relevantDateDataset, "Cannot find relevant date dataset in useKpiData");

        const yearAttribute = relevantDateDataset.dateAttributes.find(
            (dateAttribute) => dateAttribute.granularity === "GDC.time.year",
        );

        invariant(yearAttribute, "Cannot find yearAttribute in useKpiData");

        return newPopMeasure(primaryMeasure, yearAttribute.attribute.ref);
    }

    invariant(false, `Unknown comparison ${comparison}`);
}
