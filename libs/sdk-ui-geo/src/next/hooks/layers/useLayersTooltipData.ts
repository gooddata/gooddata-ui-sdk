// (C) 2026 GoodData Corporation

import { useMemo } from "react";

import { type IntlShape } from "react-intl";

import { type IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { type IExecutionConfig } from "@gooddata/sdk-model";
import { type DataViewFacade } from "@gooddata/sdk-ui";
import { type ITooltipLookupExecutionEntry, useTooltipLookupExecutions } from "@gooddata/sdk-ui-vis-commons";

import {
    type BuildFeatureKey,
    type IGeoLayerCustomTooltipExecution,
    type IGeoLayerTooltipLookup,
} from "../../layers/common/customTooltipExecution.js";
import { resolveLayerCustomTooltip } from "../../layers/common/resolveLayerCustomTooltip.js";
import { getLayerAdapter } from "../../layers/registry/adapterRegistry.js";
import { type IGeoAdapterContext } from "../../layers/registry/adapterTypes.js";
import { type IGeoChartConfig } from "../../types/config/unified.js";
import { type ILayerExecutionRecord } from "../../types/props/geoChart/internal.js";

/**
 * @internal
 */
export interface IGeoTooltipDataResult {
    tooltipLookups: Map<string, IGeoLayerTooltipLookup>;
}

interface IUseLayersTooltipDataParams {
    layerExecutions: ILayerExecutionRecord[];
    /**
     * DataViews per layer from `useLayersData`. Source of the PREPARED execution
     * definition — pushpin's `prepareExecution` adds the TOOLTIP_TEXT bucket that
     * the unprepared `record.execution.definition` lacks, and the tooltip plan
     * keys its slicing attributes off that bucket. Empty when data hasn't loaded
     * yet, in which case the plan is empty too.
     */
    layerDataViews: Map<string, DataViewFacade>;
    backend: IAnalyticalBackend;
    workspace: string;
    config?: IGeoChartConfig;
    execConfig?: IExecutionConfig;
    intl: IntlShape;
}

const EMPTY_RESULT: IGeoTooltipDataResult = { tooltipLookups: new Map() };

type IPlannedLayerTooltip = ITooltipLookupExecutionEntry<BuildFeatureKey>;

function planTooltipExecutions(
    layerExecutions: ILayerExecutionRecord[],
    layerDataViews: Map<string, DataViewFacade>,
    backend: IAnalyticalBackend,
    workspace: string,
    config: IGeoChartConfig | undefined,
    execConfig: IExecutionConfig | undefined,
    intl: IntlShape,
): IPlannedLayerTooltip[] {
    const planned: IPlannedLayerTooltip[] = [];

    for (const record of layerExecutions) {
        const adapter = getLayerAdapter(record.layer.type);
        if (!adapter.buildTooltipExecution) {
            continue;
        }

        // The unprepared `record.execution.definition` can be missing buckets
        // (e.g. pushpin's TOOLTIP_TEXT, added by `prepareExecution`). The
        // dataView's definition reflects the prepared one — wait for it.
        const dataView = layerDataViews.get(record.layerId);
        if (!dataView) {
            continue;
        }
        const mainDefinition = dataView.definition;

        const context: IGeoAdapterContext = {
            backend,
            workspace,
            config,
            execConfig,
            intl,
        };

        let built: IGeoLayerCustomTooltipExecution | null;
        try {
            built = adapter.buildTooltipExecution(record.layer, context, mainDefinition);
        } catch {
            continue;
        }

        if (!built) {
            continue;
        }

        planned.push({
            key: record.layerId,
            execution: built.execution,
            context: built.buildFeatureKey,
        });
    }

    return planned;
}

export function useLayersTooltipData(params: IUseLayersTooltipDataParams): IGeoTooltipDataResult {
    const { layerExecutions, layerDataViews, backend, workspace, config, execConfig, intl } = params;

    const isExportMode = config?.isExportMode ?? false;

    const tooltipEnabled =
        !isExportMode &&
        layerExecutions.some((record) => {
            const tooltip = resolveLayerCustomTooltip(record.layer, config);
            return Boolean(tooltip?.enabled) && Boolean(tooltip?.content);
        });

    // Per-layer tooltip edits change `layerExecutions` identity (customTooltip is part of the
    // normalization fingerprint). The chart-level fallback `config.customTooltip` — used by
    // direct GeoChart consumers — is NOT in that fingerprint, so track its content here too;
    // otherwise switching between two enabled chart-level templates would reuse the old plan.
    const chartTooltipContent = config?.customTooltip?.content ?? "";

    // `config` / `execConfig` are excluded from deps: any change that affects the tooltip
    // execution is already baked into `record.execution` upstream (or captured above).
    // `intl` is read inside the planning function for forward-compat with future adapters.
    const planned = useMemo<IPlannedLayerTooltip[]>(() => {
        if (!tooltipEnabled || layerExecutions.length === 0) {
            return [];
        }
        return planTooltipExecutions(
            layerExecutions,
            layerDataViews,
            backend,
            workspace,
            config,
            execConfig,
            intl,
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tooltipEnabled, layerExecutions, layerDataViews, backend, workspace, chartTooltipContent]);

    const separators = config?.separators;

    const lookupResults = useTooltipLookupExecutions(planned, separators);

    // Lookup-table construction is downstream of the cancelable promise so a
    // separators-only change rebuilds the cached strings without a backend call.
    // No stale-guard needed here: `useTooltipLookupExecutions` clears its result
    // when the planned set changes, so a planned-set switch surfaces as
    // `EMPTY_RESULT` until the new executions land.
    return useMemo<IGeoTooltipDataResult>(() => {
        if (lookupResults.size === 0) {
            return EMPTY_RESULT;
        }
        const map = new Map<string, IGeoLayerTooltipLookup>();
        for (const [layerId, entry] of lookupResults) {
            map.set(layerId, { lookup: entry.lookup, buildFeatureKey: entry.context });
        }
        return { tooltipLookups: map };
    }, [lookupResults]);
}
