// (C) 2025-2026 GoodData Corporation

import { type ReactElement } from "react";

import { useIntl } from "react-intl";

import {
    createExportErrorFunction,
    createExportFunction,
    useBackendStrict,
    useWorkspaceStrict,
} from "@gooddata/sdk-ui";

import { GeoChartNextProviders } from "./GeoChartNextProviders.js";
import { GeoErrorComponent } from "./GeoErrorComponent.js";
import { GeoLoadingComponent } from "./GeoLoadingComponent.js";
import { RenderGeoChartNext } from "./RenderGeoChartNext.js";
import { useGeoChartNextProps } from "../context/GeoChartNextContext.js";
import { useGeoChartData } from "../hooks/dataLoading/useGeoChartDataPipeline.js";
import { useCallbackOnChange } from "../hooks/utils/useCallbackOnChange.js";
import { type ILayerExecutionRecord } from "../types/props/geoChartNext/internal.js";

/**
 * Component that loads all layer data before rendering.
 * This is the single async loading gate - everything below is synchronous.
 *
 * @internal
 */
export function GeoChartNextDataLoader({
    layerExecutions,
}: {
    layerExecutions: ILayerExecutionRecord[];
}): ReactElement {
    const props = useGeoChartNextProps();
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
        <GeoChartNextProviders
            layerExecutions={layerExecutions}
            layerOutputs={layerOutputs}
            colorPalette={colorPalette}
        >
            <RenderGeoChartNext />
        </GeoChartNextProviders>
    );
}
