// (C) 2019-2022 GoodData Corporation
import { IAnalyticalBackend, IPreparedExecution } from "@gooddata/sdk-backend-spi";
import {
    useBackend,
    useResolveValuesWithPlaceholders,
    useWorkspace,
    AttributesMeasuresOrPlaceholders,
    AttributesOrPlaceholders,
    TotalsOrPlaceholders,
    NullableFiltersOrPlaceholders,
    SortsOrPlaceholders,
} from "../base";
import { createExecution } from "./createExecution";

/**
 * @deprecated use {@link useExecutionDataView} instead
 * @beta
 */
export interface IUseExecutionConfig {
    /**
     * Data series will be built using the provided measures that are further scoped for
     * elements of the specified attributes.
     */
    seriesBy: AttributesMeasuresOrPlaceholders;

    /**
     * Slice all data series by elements of these attributes.
     */
    slicesBy?: AttributesOrPlaceholders;

    /**
     * Include these totals among the data slices.
     */
    totals?: TotalsOrPlaceholders;

    /**
     * Filters to apply on server side.
     */
    filters?: NullableFiltersOrPlaceholders;

    /**
     * Sorting to apply on server side.
     */
    sortBy?: SortsOrPlaceholders;

    /**
     * Resolution context for composed placeholders.
     */
    placeholdersResolutionContext?: any;

    /**
     * Informative name of the component.
     *
     * @remarks
     * This value is sent as telemetry information together with the actual execution request.
     * We recommend to set this because it can be useful for diagnostic purposes.
     *
     * Defaults 'Execute'.
     */
    componentName?: string;

    /**
     * Backend to work with.
     *
     * @remarks
     * Note: the backend must come either from this property or from BackendContext. If you do not specify
     * backend here, then the executor MUST be rendered within an existing BackendContext.
     */
    backend?: IAnalyticalBackend;

    /**
     * Workspace where execution should be executed.
     *
     * @remarks
     * Note: the workspace must come either from this property or from WorkspaceContext. If you do not specify
     * workspace here, then the executor MUST be rendered within an existing WorkspaceContext.
     */
    workspace?: string;
}

/**
 * This hook provides a simplified interface for creating executions.
 *
 * @remarks
 * It builds the execution on top of the backend passed to the BackendProvider, and workspace passed to the WorkspaceProvider.
 *
 * @deprecated use {@link useExecutionDataView} instead
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
