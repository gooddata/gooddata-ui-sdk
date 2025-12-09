// (C) 2025 GoodData Corporation

import { LoadingComponent as DefaultLoadingComponent } from "@gooddata/sdk-ui";

import { useGeoChartNextProps } from "../context/GeoChartNextContext.js";

/**
 * @internal
 */
export function GeoLoadingComponent() {
    const { LoadingComponent } = useGeoChartNextProps();
    const Loading = LoadingComponent ?? DefaultLoadingComponent;

    return <Loading />;
}
