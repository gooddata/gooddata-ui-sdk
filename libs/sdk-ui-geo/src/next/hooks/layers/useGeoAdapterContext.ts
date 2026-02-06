// (C) 2025-2026 GoodData Corporation

import { useMemo } from "react";

import { useIntl } from "react-intl";

import { useBackendStrict, useWorkspaceStrict } from "@gooddata/sdk-ui";

import { useGeoChartProps } from "../../context/GeoChartContext.js";
import type { IGeoAdapterContext } from "../../layers/registry/adapterTypes.js";

/**
 * Builds adapter context shared by layer rendering logic.
 *
 * @internal
 */
export function useGeoAdapterContext(): IGeoAdapterContext {
    const props = useGeoChartProps();
    const intl = useIntl();
    const backend = useBackendStrict(props.backend, "useGeoAdapterContext");
    const workspace = useWorkspaceStrict(props.workspace, "useGeoAdapterContext");

    return useMemo(
        () => ({
            backend,
            workspace,
            config: props.config,
            execConfig: props.execConfig,
            intl,
        }),
        [backend, workspace, props.config, props.execConfig, intl],
    );
}
