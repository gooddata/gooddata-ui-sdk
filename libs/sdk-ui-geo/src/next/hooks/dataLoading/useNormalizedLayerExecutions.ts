// (C) 2025 GoodData Corporation

import { useMemo } from "react";

import { type IDataVisualizationProps } from "@gooddata/sdk-ui";

import { hasGeoLayerContext } from "../../layers/execution/layerContext.js";
import { type IGeoLayer } from "../../types/layers/index.js";
import { type ILayerExecutionRecord } from "../../types/props/geoChartNext/internal.js";

type WithoutExecutions<T> = Omit<T, "execution" | "executions">;

/**
 * Result of normalizing layer executions
 *
 * @internal
 */
export interface INormalizedLayerExecutions<TCoreProps> {
    /**
     * All layer executions paired with their layer definitions
     */
    layerExecutions: ILayerExecutionRecord[];

    /**
     * Core props with derived layers array and resolved type
     */
    propsWithLayers: TCoreProps & { layers: IGeoLayer[] };
}

/**
 * Normalizes executions into paired layer execution records.
 *
 * @remarks
 * Extracts layer metadata from execution contexts and pairs them together
 * so downstream hooks can rely on the combined data.
 *
 * @internal
 */
export function useNormalizedLayerExecutions<TCoreProps extends IDataVisualizationProps>(
    props: TCoreProps,
): INormalizedLayerExecutions<WithoutExecutions<TCoreProps>> {
    const { execution, executions, ...coreProps } = props;

    return useMemo(() => {
        const allExecutions = [execution, ...(executions ?? [])];

        const layerExecutions: ILayerExecutionRecord[] = [];

        allExecutions.forEach((candidate) => {
            if (!hasGeoLayerContext(candidate)) {
                return;
            }

            layerExecutions.push({
                layerId: candidate.context.id,
                layer: candidate.context,
                execution: candidate,
            });
        });

        const layers = layerExecutions.map((record) => record.layer);

        const propsWithLayers = {
            ...coreProps,
            layers,
        } as WithoutExecutions<TCoreProps> & { layers: IGeoLayer[] };

        return { layerExecutions, propsWithLayers };
    }, [execution, executions, coreProps]);
}
