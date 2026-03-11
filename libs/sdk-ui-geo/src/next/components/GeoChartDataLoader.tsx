// (C) 2025-2026 GoodData Corporation

import { type ReactElement, useMemo, useState } from "react";

import { useIntl } from "react-intl";

import {
    type GoodDataSdkError,
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

    const { layerOutputs, status, error } = useGeoChartData({
        layerExecutions,
        backend,
        workspace,
        config: props.config,
        execConfig: props.execConfig,
        intl,
    });
    const mapInitializationInputs = useMemo(
        () => ({
            backend,
            mapStyle: props.config?.mapStyle,
            tileset: props.config?.tileset,
        }),
        [backend, props.config?.mapStyle, props.config?.tileset],
    );
    const [mapError, setMapError] = useState<GoodDataSdkError | null>(null);
    const [previousMapInitializationInputs, setPreviousMapInitializationInputs] =
        useState(mapInitializationInputs);
    const isPendingOrLoading = status === "loading" || status === "pending";

    // Reset stale map initialization errors before commit so loading/input changes do not flash the error UI.
    if (previousMapInitializationInputs !== mapInitializationInputs || (mapError && isPendingOrLoading)) {
        if (mapError) {
            setMapError(null);
        }

        if (previousMapInitializationInputs !== mapInitializationInputs) {
            setPreviousMapInitializationInputs(mapInitializationInputs);
        }
    }

    const combinedError = error ?? (isPendingOrLoading ? null : mapError);

    const isLoading = status === "loading";
    const { onLoadingChanged, onError } = props;

    useCallbackOnChange(isLoading, (loading) => onLoadingChanged?.({ isLoading: loading }));
    useCallbackOnChange(combinedError, (err) => onError?.(err!), Boolean(combinedError));

    const primaryLayerId = layerExecutions[0]?.layerId;
    const primaryDataView =
        status === "success" && primaryLayerId ? layerOutputs.get(primaryLayerId)?.dataView : undefined;
    const primaryDataViewFingerprint = primaryDataView?.fingerprint();
    const exportReadyState = useMemo(
        () => ({
            fingerprint: primaryDataViewFingerprint,
            hasError: Boolean(combinedError),
        }),
        [primaryDataViewFingerprint, combinedError],
    );

    useCallbackOnChange(
        exportReadyState,
        () => {
            if (!primaryDataView || combinedError) {
                return;
            }
            props.onExportReady?.(createExportFunction(primaryDataView.result(), props.exportTitle));
        },
        status === "success" && Boolean(primaryDataView) && Boolean(props.onExportReady),
    );

    useCallbackOnChange(
        combinedError,
        (err) => props.onExportReady?.(createExportErrorFunction(err!)),
        Boolean(combinedError) && Boolean(props.onExportReady),
    );

    if (combinedError) {
        return <GeoErrorComponent error={combinedError} />;
    }

    if (status !== "success") {
        return <GeoLoadingComponent />;
    }

    return (
        <GeoChartProviders layerExecutions={layerExecutions} layerOutputs={layerOutputs}>
            <RenderGeoChart onMapError={setMapError} />
        </GeoChartProviders>
    );
}
