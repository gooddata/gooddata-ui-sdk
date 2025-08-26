// (C) 2019-2025 GoodData Corporation
import React, { useCallback, useMemo, useState } from "react";

import { idRef } from "@gooddata/sdk-model";
import { ErrorComponent, LoadingComponent } from "@gooddata/sdk-ui";
import { CustomToolbarComponent, DashboardConfig } from "@gooddata/sdk-ui-dashboard";
import { IEmbeddedPlugin, useDashboardLoaderWithPluginManipulation } from "@gooddata/sdk-ui-loaders";

// this import will be renamed in plugin-toolkit
import { PluginToolbar } from "./PluginToolbar.js";
import PluginFactory from "../plugin/index.js";

const Plugins: IEmbeddedPlugin[] = [{ factory: PluginFactory }];
const Config: DashboardConfig = {
    mapboxToken: process.env.MAPBOX_TOKEN,
    agGridToken: process.env.AG_GRID_TOKEN,
};
const DashboardRef = idRef(process.env.DASHBOARD_ID!, "analyticalDashboard");

export const PluginLoader = () => {
    const { loaderStatus, reloadPlugins, setExtraPlugins, extraPlugins, hidePluginOverlays } =
        useDashboardLoaderWithPluginManipulation({
            dashboard: DashboardRef,
            loadingMode: "staticOnly",
            config: Config,
            extraPlugins: Plugins,
        });

    const isPluginEnabled = !!extraPlugins?.length;

    const togglePlugin = useCallback(() => {
        if (isPluginEnabled) {
            setExtraPlugins([]);
        } else {
            setExtraPlugins(Plugins);
        }
    }, [isPluginEnabled, setExtraPlugins]);

    const [isHideOverlaysEnabled, setIsHideOverlaysEnabled] = useState(true);
    const hidePluginsOverlaysCallbacks = useCallback(() => {
        if (isHideOverlaysEnabled) {
            setIsHideOverlaysEnabled(false);
            hidePluginOverlays();
        }
    }, [isPluginEnabled, setExtraPlugins]);

    const { status, error, result } = loaderStatus;

    const ToolbarComponent = useMemo<CustomToolbarComponent>(() => {
        return function CustomToolbar() {
            return (
                <PluginToolbar
                    isPluginEnabled={isPluginEnabled}
                    reloadPlugins={reloadPlugins}
                    togglePlugin={togglePlugin}
                    isHideOverlaysEnabled={isHideOverlaysEnabled}
                    hideOverlays={hidePluginsOverlaysCallbacks}
                />
            );
        };
    }, [isPluginEnabled, reloadPlugins, togglePlugin]);

    if (status === "loading") {
        return <LoadingComponent />;
    }

    if (status === "error" || result === undefined) {
        return <ErrorComponent message={error?.message ?? ""} />;
    }

    return <result.DashboardComponent {...result.props} ToolbarComponent={ToolbarComponent} />;
};
