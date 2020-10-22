// (C) 2020 GoodData Corporation
import { IAnalyticalBackend, IWidget } from "@gooddata/sdk-backend-spi";
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
    useBackend,
    useCancelablePromise,
    UseCancelablePromiseState,
    useWorkspace,
} from "@gooddata/sdk-ui";
import invariant, { InvariantError } from "ts-invariant";

interface IUseKpiMeasuresConfig {
    kpiWidget: IWidget;
    filters?: IFilter[];
    /**
     * Backend to work with.
     *
     * Note: the backend must come either from this property or from BackendContext. If you do not specify
     * backend here, then the executor MUST be rendered within an existing BackendContext.
     */
    backend?: IAnalyticalBackend;

    /**
     * Workspace where the insight exists.
     *
     * Note: the workspace must come either from this property or from WorkspaceContext. If you do not specify
     * workspace here, then the executor MUST be rendered within an existing WorkspaceContext.
     */
    workspace?: string;
}

interface IUseKpiMeasuresResult {
    primaryMeasure: IMeasure;
    secondaryMeasure?: IMeasure<IPoPMeasureDefinition> | IMeasure<IPreviousPeriodMeasureDefinition>;
}

export function useKpiMeasures({
    kpiWidget,
    filters,
    backend,
    workspace,
}: IUseKpiMeasuresConfig): UseCancelablePromiseState<IUseKpiMeasuresResult, GoodDataSdkError> {
    const backendFromContext = useBackend();
    const workspaceFromContext = useWorkspace();

    const effectiveBackend = backend ?? backendFromContext;
    const effectiveWorkspace = workspace ?? workspaceFromContext;

    const promise = async () => {
        if (!kpiWidget.kpi) {
            throw new InvariantError("The provided widget is not a KPI widget.");
        }

        const primaryMeasure = newMeasure(kpiWidget.kpi.metric);

        const comparison = kpiWidget.kpi.comparisonType;

        const isAllTime =
            !filters || !filters.some((filter) => isDateFilter(filter) && !isAllTimeDateFilter(filter));

        // TODO irrelevant date filters detection
        if (comparison === "none" || isAllTime) {
            return { primaryMeasure };
        }

        if (comparison === "previousPeriod") {
            const secondaryMeasure = newPreviousPeriodMeasure(primaryMeasure, [
                { dataSet: kpiWidget.dateDataSet, periodsAgo: 1 },
            ]);

            return { primaryMeasure, secondaryMeasure };
        }

        if (comparison === "lastYear") {
            const secondaryMeasure = await getLastYearComparisonMeasure(
                effectiveBackend,
                effectiveWorkspace,
                primaryMeasure,
                kpiWidget.dateDataSet,
            );

            return { primaryMeasure, secondaryMeasure };
        }

        invariant(false, `Unknown comparison ${comparison}`);
    };

    return useCancelablePromise({ promise });
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

    return newPopMeasure(primaryMeasure, yearAttribute.attribute);
}
