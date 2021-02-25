// (C) 2020-2021 GoodData Corporation
import {
    FilterContextItem,
    IAnalyticalBackend,
    IFilterContext,
    ITempFilterContext,
    IKpiWidget,
} from "@gooddata/sdk-backend-spi";
import {
    IMeasure,
    IPoPMeasureDefinition,
    IPreviousPeriodMeasureDefinition,
    isAllTimeDateFilter,
    isDateFilter,
    isUriRef,
    newMeasure,
    newPopMeasure,
    newPreviousPeriodMeasure,
    ObjRef,
} from "@gooddata/sdk-model";
import {
    GoodDataSdkError,
    OnError,
    useBackend,
    useCancelablePromise,
    UseCancelablePromiseState,
    useWorkspace,
} from "@gooddata/sdk-ui";
import invariant from "ts-invariant";
import { filterContextItemsToFiltersForWidget, filterContextToFiltersForWidget } from "../converters";
import { IDashboardFilter } from "../../../dashboardView/types";

interface IUseKpiDataConfig {
    kpiWidget?: IKpiWidget;
    filterContext?: IFilterContext | ITempFilterContext;
    filters?: FilterContextItem[];
    backend?: IAnalyticalBackend;
    workspace?: string;
    onError?: OnError;
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
    filters,
    filterContext,
    backend,
    workspace,
}: IUseKpiDataConfig): UseCancelablePromiseState<IUseKpiDataResult, GoodDataSdkError> {
    const effectiveBackend = useBackend(backend);
    const effectiveWorkspace = useWorkspace(workspace);

    const promise = kpiWidget
        ? async (): Promise<IUseKpiDataResult> => {
              invariant(kpiWidget.kpi, "The provided widget is not a KPI widget.");

              const allFilters = filters
                  ? filterContextItemsToFiltersForWidget(filters, kpiWidget)
                  : filterContextToFiltersForWidget(filterContext, kpiWidget);

              const effectiveFilters = (await effectiveBackend
                  .workspace(effectiveWorkspace)
                  .dashboards()
                  .getResolvedFiltersForWidget(kpiWidget, allFilters)) as IDashboardFilter[]; // all the inputs are IDashboardFilter, so the result must be too

              const primaryMeasure = newMeasure(kpiWidget.kpi.metric);

              const comparison = kpiWidget.kpi.comparisonType;

              const isAllTime =
                  !effectiveFilters ||
                  !effectiveFilters.some((filter) => isDateFilter(filter) && !isAllTimeDateFilter(filter));

              if (comparison === "none" || isAllTime) {
                  return { primaryMeasure, effectiveFilters, allFilters };
              }

              if (comparison === "previousPeriod") {
                  const secondaryMeasure = newPreviousPeriodMeasure(primaryMeasure, [
                      { dataSet: kpiWidget.dateDataSet, periodsAgo: 1 },
                  ]);

                  return { primaryMeasure, secondaryMeasure, effectiveFilters, allFilters };
              }

              if (comparison === "lastYear") {
                  const secondaryMeasure = await getLastYearComparisonMeasure(
                      effectiveBackend,
                      effectiveWorkspace,
                      primaryMeasure,
                      kpiWidget.dateDataSet,
                  );

                  return { primaryMeasure, secondaryMeasure, effectiveFilters, allFilters };
              }

              invariant(false, `Unknown comparison ${comparison}`);
          }
        : null;

    return useCancelablePromise({ promise }, [
        effectiveBackend,
        effectiveWorkspace,
        filters,
        filterContext,
        kpiWidget,
    ]);
}

async function getLastYearComparisonMeasure(
    backend: IAnalyticalBackend,
    workspace: string,
    primaryMeasure: IMeasure,
    targetDateDataset: ObjRef,
): Promise<IMeasure<IPoPMeasureDefinition>> {
    const catalog = await backend.workspace(workspace).catalog().forTypes(["dateDataset"]).load();
    const dateDatasets = catalog.dateDatasets();
    const relevantDateDataset = dateDatasets.find((dateDataset) => {
        if (isUriRef(targetDateDataset)) {
            return dateDataset.dataSet.uri === targetDateDataset.uri;
        } else {
            return dateDataset.dataSet.id === targetDateDataset.identifier;
        }
    });
    const yearAttribute = relevantDateDataset.dateAttributes.find(
        (dateAttribute) => dateAttribute.granularity === "GDC.time.year",
    );

    return newPopMeasure(primaryMeasure, yearAttribute.attribute.ref);
}
