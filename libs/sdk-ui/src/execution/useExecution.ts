// (C) 2019-2021 GoodData Corporation
import { IAnalyticalBackend, IPreparedExecution } from "@gooddata/sdk-backend-spi";
import { IAttributeOrMeasure, IAttribute, ITotal, INullableFilter, ISortItem } from "@gooddata/sdk-model";
import { useBackend, useWorkspace } from "../base";
import { createExecution } from "./createExecution";

export interface IUseExecutionConfig {
    /**
     * Data series will be built using the provided measures that are optionally further scoped for
     * elements of the specified attributes.
     */
    seriesBy: IAttributeOrMeasure[];

    /**
     * Optionally slice all data series by elements of these attributes.
     */
    slicesBy?: IAttribute[];

    /**
     * Optionally include these totals among the data slices.
     */
    totals?: ITotal[];

    /**
     * Optional filters to apply on server side.
     */
    filters?: INullableFilter[];

    /**
     * Optional sorting to apply on server side.
     */
    sortBy?: ISortItem[];

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

    const execution = createExecution({
        ...config,
        backend,
        workspace,
    });

    return execution;
}
