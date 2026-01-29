// (C) 2025-2026 GoodData Corporation

import { useMemo } from "react";

import type { IAnalyticalBackend, IPreparedExecution } from "@gooddata/sdk-backend-spi";
import type { IExecutionConfig, INullableFilter } from "@gooddata/sdk-model";
import { useBackendStrict, useWorkspaceStrict } from "@gooddata/sdk-ui";

import { buildLayerExecution } from "../../layers/execution/buildLayerExecution.js";
import type { IGeoChartConfig } from "../../types/config/unified.js";
import type { IGeoLayer } from "../../types/layers/index.js";

/**
 * Hook that creates prepared executions for all layers using layer adapters.
 *
 * @remarks
 * This prepares the standard IDataVisualization execution props (`execution` + `executions`) by
 * building layer-specific executions (via {@link buildLayerExecution}) and splitting the first
 * layer as the primary execution.
 *
 * @internal
 */
interface ILayerExecutionsResult {
    primaryExecution?: IPreparedExecution;
    additionalExecutions: IPreparedExecution[];
}

export function useLayersExecutions(props: {
    layers: IGeoLayer[];
    backend?: IAnalyticalBackend;
    workspace?: string;
    config?: IGeoChartConfig;
    execConfig?: IExecutionConfig;
    filters?: INullableFilter[];
}): ILayerExecutionsResult {
    const { layers, config, execConfig, filters } = props;
    const backend = useBackendStrict(props.backend, "useLayersExecutions");
    const workspace = useWorkspaceStrict(props.workspace, "useLayersExecutions");

    return useMemo(() => {
        const executions = layers.map((layer) =>
            buildLayerExecution(layer, {
                backend,
                workspace,
                config,
                execConfig,
                globalFilters: filters,
            }),
        );
        const [primaryExecution, ...additionalExecutions] = executions;

        return { primaryExecution, additionalExecutions };
    }, [layers, backend, workspace, config, execConfig, filters]);
}
