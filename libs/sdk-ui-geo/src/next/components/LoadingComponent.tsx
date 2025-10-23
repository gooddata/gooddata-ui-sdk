// (C) 2025 GoodData Corporation

import { LoadingComponent as DefaultLoadingComponent } from "@gooddata/sdk-ui";

import { useGeoPushpinProps } from "../context/GeoPushpinPropsContext.js";

/**
 * @internal
 */
export function LoadingComponent() {
    const { LoadingComponent } = useGeoPushpinProps();
    const Loading = LoadingComponent ?? DefaultLoadingComponent;

    return <Loading />;
}
