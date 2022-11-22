// (C) 2019-2022 GoodData Corporation
import React, { useCallback, useMemo } from "react";
import { idRef } from "@gooddata/sdk-model";
import { IEmbeddedPlugin, useDashboardLoaderWithPluginManipulation } from "@gooddata/sdk-ui-loaders";
import PluginFactory from "../plugin";
import { DEFAULT_DASHBOARD_ID } from "./constants";
import { DashboardConfig, CustomToolbarComponent } from "@gooddata/sdk-ui-dashboard";
import { ErrorComponent, LoadingComponent } from "@gooddata/sdk-ui";
import { PluginToolbar } from "./PluginToolbar";

const Plugins: IEmbeddedPlugin[] = [{ factory: PluginFactory }];
const Config: DashboardConfig = { mapboxToken: process.env.MAPBOX_TOKEN };
const DashboardRef = idRef(process.env.DASHBOARD_ID || DEFAULT_DASHBOARD_ID, "analyticalDashboard");

export const PluginLoader = () => {
    const { loaderStatus, reloadPlugins, setExtraPlugins, extraPlugins } =
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

    const { status, error, result } = loaderStatus;

    const ToolbarComponent = useMemo<CustomToolbarComponent>(() => {
        return function CustomToolbar() {
            return (
                <PluginToolbar
                    isPluginEnabled={isPluginEnabled}
                    reloadPlugins={reloadPlugins}
                    togglePlugin={togglePlugin}
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
