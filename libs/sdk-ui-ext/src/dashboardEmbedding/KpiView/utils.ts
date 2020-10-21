// (C) 2020 GoodData Corporation
import { IAnalyticalBackend, IWidget } from "@gooddata/sdk-backend-spi";
import {
    IFilter,
    IMeasure,
    IPoPMeasureDefinition,
    IPreviousPeriodMeasureDefinition,
    isAllTimeDateFilter,
    isUriRef,
    newMeasure,
    newPopMeasure,
    newPreviousPeriodMeasure,
} from "@gooddata/sdk-model";
import {
    GoodDataSdkError,
    useBackend,
    useCancelablePromise,
    UseCancelablePromiseState,
    useWorkspace,
} from "@gooddata/sdk-ui";
import { InvariantError } from "ts-invariant";

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

        const isAllTime = !filters || filters.some(isAllTimeDateFilter);
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

        const targetDataset = kpiWidget.dateDataSet;

        const catalog = await effectiveBackend
            .workspace(effectiveWorkspace)
            .catalog()
            .forTypes(["dateDataset"])
            .load();
        const dateDatasets = catalog.dateDatasets();
        const relevantDateDataset = dateDatasets.find((dateDataset) => {
            if (isUriRef(targetDataset)) {
                return dateDataset.dataSet.uri === targetDataset.uri;
            } else {
                return dateDataset.dataSet.id === targetDataset.identifier;
            }
        });
        const yearAttribute = relevantDateDataset.dateAttributes.find(
            (dateAttribute) => dateAttribute.granularity === "GDC.time.year",
        );

        const secondaryMeasure = newPopMeasure(primaryMeasure, yearAttribute.attribute);
        return { primaryMeasure, secondaryMeasure };
    };

    return useCancelablePromise({ promise });
}
