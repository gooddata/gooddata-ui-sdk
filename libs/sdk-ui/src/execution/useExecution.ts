// (C) 2019-2021 GoodData Corporation
import { IAnalyticalBackend, IPreparedExecution } from "@gooddata/sdk-backend-spi";
import { IAttribute, ITotal, INullableFilter, ISortItem } from "@gooddata/sdk-model";
import {
    AnyMeasure,
    useBackend,
    useResolveValuesWithPlaceholders,
    useWorkspace,
    ValuesOrPlaceholders,
} from "../base";
import { createExecution } from "./createExecution";

/**
 * @beta
 */
export interface IUseExecutionConfig {
    /**
     * Data series will be built using the provided measures that are optionally further scoped for
     * elements of the specified attributes.
     */
    seriesBy: ValuesOrPlaceholders<IAttribute | AnyMeasure>;

    /**
     * Optionally slice all data series by elements of these attributes.
     */
    slicesBy?: ValuesOrPlaceholders<IAttribute>;

    /**
     * Optionally include these totals among the data slices.
     */
    totals?: ValuesOrPlaceholders<ITotal>;

    /**
     * Optional filters to apply on server side.
     */
    filters?: ValuesOrPlaceholders<INullableFilter>;

    /**
     * Optional sorting to apply on server side.
     */
    sortBy?: ValuesOrPlaceholders<ISortItem>;

    /**
     * Optional resolution context for composed placeholders.
     */
    placeholdersResolutionContext?: any;

    /**
     * Optional informative name of the component. This value is sent as telemetry information together
     * with the actual execution request. We recommend to set this because it can be useful for diagnostic
     * purposes.
     *
     * Defaults 'Execute'.
     */
    componentName?: string;

    /**
     * Backend to work with.
     *
     * Note: the backend must come either from this property or from BackendContext. If you do not specify
     * backend here, then the executor MUST be rendered within an existing BackendContext.
     */
    backend?: IAnalyticalBackend;

    /**
     * Workspace where execution should be executed.
     *
     * Note: the workspace must come either from this property or from WorkspaceContext. If you do not specify
     * workspace here, then the executor MUST be rendered within an existing WorkspaceContext.
     */
    workspace?: string;
}

/**
 * This hook provides a simplified interface for creating executions.
 * It builds the execution on top of the backend passed to the BackendProvider, and workspace passed to the WorkspaceProvider.
 *
 * @beta
 */
export function useExecution(config: IUseExecutionConfig): IPreparedExecution {
    const backend = useBackend(config.backend);
    const workspace = useWorkspace(config.workspace);
    const [seriesBy, slicesBy, totals, filters, sortBy] = useResolveValuesWithPlaceholders(
        [config.seriesBy, config.slicesBy, config.totals, config.filters, config.sortBy],
        config.placeholdersResolutionContext,
    );

    return createExecution({
        ...config,
        backend,
        workspace,
        seriesBy,
        slicesBy,
        totals,
        filters,
        sortBy,
    });
}
