// (C) 2021-2022 GoodData Corporation

import React from "react";
import { ObjRef } from "@gooddata/sdk-model";
import { ReactDashboardContext } from "@gooddata/sdk-ui-dashboard";
import { useDashboardLoader, AdaptiveLoadOptions } from "@gooddata/sdk-ui-loaders";
import { LoadingComponent } from "@gooddata/sdk-ui";

interface PluginLoaderProps {
    dashboardRef: ObjRef;
}

const adaptiveLoadOptions: AdaptiveLoadOptions = {
    moduleFederationIntegration: {
        __webpack_init_sharing__:
            // this can be undefined globally during tests
            typeof __webpack_init_sharing__ !== "undefined"
                ? __webpack_init_sharing__
                : () => Promise.resolve(),
        __webpack_share_scopes__:
            // this can be undefined globally during tests
            typeof __webpack_share_scopes__ !== "undefined" ? __webpack_share_scopes__ : null,
    },
};

export const PluginLoader: React.FC<PluginLoaderProps> = (props) => {
    const { dashboardRef } = props;
    const loader = useDashboardLoader({
        dashboard: dashboardRef,
        loadingMode: "adaptive",
        adaptiveLoadOptions,
    });

    if (loader.status !== "success") {
        return <LoadingComponent />;
    }

    const { DashboardComponent, props: dashboardProps } = loader.result;

    return <DashboardComponent {...dashboardProps} additionalReduxContext={ReactDashboardContext} />;
};
