// (C) 2025-2026 GoodData Corporation

import { type ReactElement } from "react";

import { useIntl } from "react-intl";

import {
    createExportErrorFunction,
    createExportFunction,
    useBackendStrict,
    useWorkspaceStrict,
} from "@gooddata/sdk-ui";

import { GeoChartProviders } from "./GeoChartProviders.js";
import { GeoErrorComponent } from "./GeoErrorComponent.js";
import { GeoLoadingComponent } from "./GeoLoadingComponent.js";
import { RenderGeoChart } from "./RenderGeoChart.js";
import { useGeoChartProps } from "../context/GeoChartContext.js";
import { useGeoChartData } from "../hooks/dataLoading/useGeoChartDataPipeline.js";
import { useCallbackOnChange } from "../hooks/utils/useCallbackOnChange.js";
import { type ILayerExecutionRecord } from "../types/props/geoChart/internal.js";

/**
 * Component that loads all layer data before rendering.
 * This is the single async loading gate - everything below is synchronous.
 *
 * @internal
 */
export function GeoChartDataLoader({
    layerExecutions,
}: {
    layerExecutions: ILayerExecutionRecord[];
}): ReactElement {
    const props = useGeoChartProps();
    const intl = useIntl();
    const backend = useBackendStrict(props.backend, "GeoDataLoadingGate");
    const workspace = useWorkspaceStrict(props.workspace, "GeoDataLoadingGate");

    const { layerOutputs, status, error, colorPalette } = useGeoChartData({
        layerExecutions,
        backend,
        workspace,
        config: props.config,
        execConfig: props.execConfig,
        intl,
    });

    const isLoading = status === "loading";
    const { onLoadingChanged, onError } = props;

    useCallbackOnChange(isLoading, (loading) => onLoadingChanged?.({ isLoading: loading }));
    useCallbackOnChange(error, (err) => onError?.(err!), Boolean(error));

    const primaryLayerId = layerExecutions[0]?.layerId;
    const primaryDataView =
        status === "success" && primaryLayerId ? layerOutputs.get(primaryLayerId)?.dataView : undefined;

    useCallbackOnChange(
        primaryDataView?.fingerprint(),
        () => {
            if (!primaryDataView) {
                return;
            }
            props.onExportReady?.(createExportFunction(primaryDataView.result(), props.exportTitle));
        },
        status === "success" && Boolean(primaryDataView) && Boolean(props.onExportReady),
    );

    useCallbackOnChange(
        error,
        (err) => props.onExportReady?.(createExportErrorFunction(err!)),
        Boolean(error) && Boolean(props.onExportReady),
    );

    if (status === "error" && error) {
        return <GeoErrorComponent error={error} />;
    }

    if (status !== "success") {
        return <GeoLoadingComponent />;
    }

    return (
        <GeoChartProviders
            layerExecutions={layerExecutions}
            layerOutputs={layerOutputs}
            colorPalette={colorPalette}
        >
            <RenderGeoChart />
        </GeoChartProviders>
    );
}
