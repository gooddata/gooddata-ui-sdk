// (C) 2020-2021 GoodData Corporation
import {
    IAnalyticalBackend,
    IFilterContext,
    ITempFilterContext,
    IKpiWidget,
} from "@gooddata/sdk-backend-spi";
import {
    IFilter,
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
import { filterContextToFiltersForWidget } from "../../converters";

interface IUseKpiDataConfig {
    kpiWidget: IKpiWidget;
    filterContext?: IFilterContext | ITempFilterContext;
    filters?: IFilter[];
    backend?: IAnalyticalBackend;
    workspace?: string;
    onError?: OnError;
}

interface IUseKpiDataResult {
    primaryMeasure: IMeasure;
    secondaryMeasure?: IMeasure<IPoPMeasureDefinition> | IMeasure<IPreviousPeriodMeasureDefinition>;
    filters: IFilter[];
}

export function useKpiData({
    kpiWidget,
    filters,
    filterContext,
    backend,
    workspace,
}: IUseKpiDataConfig): UseCancelablePromiseState<IUseKpiDataResult, GoodDataSdkError> {
    const effectiveBackend = useBackend(backend);
    const effectiveWorkspace = useWorkspace(workspace);

    const promise = async () => {
        invariant(kpiWidget.kpi, "The provided widget is not a KPI widget.");

        const filtersFromFilterContext = filterContextToFiltersForWidget(filterContext, kpiWidget);

        const inputFilters = [...filtersFromFilterContext, ...(filters ?? [])];

        const relevantFilters = await effectiveBackend
            .workspace(effectiveWorkspace)
            .dashboards()
            .getResolvedFiltersForWidget(kpiWidget, inputFilters);

        const primaryMeasure = newMeasure(kpiWidget.kpi.metric);

        const comparison = kpiWidget.kpi.comparisonType;

        const isAllTime =
            !relevantFilters ||
            !relevantFilters.some((filter) => isDateFilter(filter) && !isAllTimeDateFilter(filter));

        if (comparison === "none" || isAllTime) {
            return { primaryMeasure, filters: relevantFilters };
        }

        if (comparison === "previousPeriod") {
            const secondaryMeasure = newPreviousPeriodMeasure(primaryMeasure, [
                { dataSet: kpiWidget.dateDataSet, periodsAgo: 1 },
            ]);

            return { primaryMeasure, secondaryMeasure, filters: relevantFilters };
        }

        if (comparison === "lastYear") {
            const secondaryMeasure = await getLastYearComparisonMeasure(
                effectiveBackend,
                effectiveWorkspace,
                primaryMeasure,
                kpiWidget.dateDataSet,
            );

            return { primaryMeasure, secondaryMeasure, filters: relevantFilters };
        }

        invariant(false, `Unknown comparison ${comparison}`);
    };

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
