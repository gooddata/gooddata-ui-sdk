// (C) 2025 GoodData Corporation

import { useMemo } from "react";

import { useIntl } from "react-intl";

import { DefaultColorPalette, useBackendStrict, useWorkspaceStrict } from "@gooddata/sdk-ui";

import { useGeoChartNextProps } from "../../context/GeoChartNextContext.js";
import { useGeoLayers } from "../../context/GeoLayersContext.js";
import type { IGeoAdapterContext } from "../../layers/registry/adapterTypes.js";

interface IUseGeoAdapterContextOptions {
    selectedSegmentItems?: string[];
}

/**
 * Builds adapter context shared by layer rendering logic.
 *
 * @internal
 */
export function useGeoAdapterContext({
    selectedSegmentItems,
}: IUseGeoAdapterContextOptions = {}): IGeoAdapterContext {
    const props = useGeoChartNextProps();
    const { colorPalette: contextColorPalette } = useGeoLayers();
    const intl = useIntl();
    const backend = useBackendStrict(props.backend, "useGeoAdapterContext");
    const workspace = useWorkspaceStrict(props.workspace, "useGeoAdapterContext");

    const colorPalette = useMemo(
        () => contextColorPalette ?? props.config?.colorPalette ?? DefaultColorPalette,
        [contextColorPalette, props.config?.colorPalette],
    );

    const colorMapping = useMemo(() => props.config?.colorMapping ?? [], [props.config?.colorMapping]);

    const mergedConfig = useMemo(
        () => ({
            ...props.config,
            selectedSegmentItems,
        }),
        [props.config, selectedSegmentItems],
    );

    return useMemo(
        () => ({
            backend,
            workspace,
            config: mergedConfig,
            execConfig: props.execConfig,
            colorPalette,
            colorMapping,
            intl,
        }),
        [backend, workspace, mergedConfig, props.execConfig, colorPalette, colorMapping, intl],
    );
}
