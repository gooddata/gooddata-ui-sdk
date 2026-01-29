// (C) 2025-2026 GoodData Corporation

import { LoadingComponent as DefaultLoadingComponent } from "@gooddata/sdk-ui";

import { useGeoChartProps } from "../context/GeoChartContext.js";

/**
 * @internal
 */
export function GeoLoadingComponent() {
    const { LoadingComponent } = useGeoChartProps();
    const Loading = LoadingComponent ?? DefaultLoadingComponent;

    return <Loading />;
}
