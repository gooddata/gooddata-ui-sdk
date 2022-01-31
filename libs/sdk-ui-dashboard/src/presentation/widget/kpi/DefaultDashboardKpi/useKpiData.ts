// (C) 2020-2022 GoodData Corporation
import { FilterContextItem, IAnalyticalBackend, IKpiWidget } from "@gooddata/sdk-backend-spi";
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
    useBackendStrict,
    useCancelablePromise,
    UseCancelablePromiseState,
    useWorkspaceStrict,
} from "@gooddata/sdk-ui";
import invariant from "ts-invariant";

import { filterContextItemsToDashboardFiltersByWidget } from "../../../../converters";
import { IDashboardFilter } from "../../../../types";
import { useWidgetFilters } from "../../common";

interface IUseKpiDataConfig {
    kpiWidget?: IKpiWidget;
    dashboardFilters: FilterContextItem[];
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
    dashboardFilters,
    backend,
    workspace,
}: IUseKpiDataConfig): UseCancelablePromiseState<IUseKpiDataResult, GoodDataSdkError> {
    const effectiveBackend = useBackendStrict(backend);
    const effectiveWorkspace = useWorkspaceStrict(workspace);

    const { status, result } = useWidgetFilters(kpiWidget);

    // we only put IDashboardFilters in, so we must get IDashboardFilters out as well
    const effectiveFilters = result as IDashboardFilter[] | undefined;

    const promise =
        kpiWidget && dashboardFilters && effectiveFilters && status === "success"
            ? async (): Promise<IUseKpiDataResult> => {
                  invariant(kpiWidget.kpi, "The provided widget is not a KPI widget.");

                  const allFilters = filterContextItemsToDashboardFiltersByWidget(
                      dashboardFilters,
                      kpiWidget,
                  );

                  const primaryMeasure = newMeasure(kpiWidget.kpi.metric);

                  const comparison = kpiWidget.kpi.comparisonType;

                  const isAllTime =
                      !effectiveFilters ||
                      !effectiveFilters.some(
                          (filter) => isDateFilter(filter) && !isAllTimeDateFilter(filter),
                      );

                  if (comparison === "none" || isAllTime) {
                      return { primaryMeasure, effectiveFilters, allFilters };
                  }

                  if (comparison === "previousPeriod") {
                      invariant(
                          kpiWidget.dateDataSet,
                          "Inconsistent KPI in useKpiData, it has comparison but not dateDataset",
                      );
                      const secondaryMeasure = newPreviousPeriodMeasure(primaryMeasure, [
                          { dataSet: kpiWidget.dateDataSet, periodsAgo: 1 },
                      ]);

                      return { primaryMeasure, secondaryMeasure, effectiveFilters, allFilters };
                  }

                  if (comparison === "lastYear") {
                      invariant(
                          kpiWidget.dateDataSet,
                          "Inconsistent KPI in useKpiData, it has comparison but not dateDataset",
                      );
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
        effectiveFilters,
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

    invariant(relevantDateDataset, "Cannot find relevant date dataset in useKpiData");

    const yearAttribute = relevantDateDataset.dateAttributes.find(
        (dateAttribute) => dateAttribute.granularity === "GDC.time.year",
    );

    invariant(yearAttribute, "Cannot find yearAttribute in useKpiData");

    return newPopMeasure(primaryMeasure, yearAttribute.attribute.ref);
}
