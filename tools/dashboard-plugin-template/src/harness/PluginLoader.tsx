// (C) 2019-2022 GoodData Corporation
import React, { useCallback, useMemo } from "react";
import { idRef } from "@gooddata/sdk-model";
import { IEmbeddedPlugin, useDashboardLoaderWithPluginManipulation } from "@gooddata/sdk-ui-loaders";
import PluginFactory from "../plugin";
import { DEFAULT_DASHBOARD_ID } from "./constants";
import { DashboardConfig } from "@gooddata/sdk-ui-dashboard";
import { ErrorComponent, LoadingComponent } from "@gooddata/sdk-ui";

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
    const toolbarGroups = useMemo(() => {
        return [
            {
                title: "Plugins",
                buttons: [
                    {
                        icon: "sync",
                        onClick: reloadPlugins,
                        id: "sync-plugins",
                        disabled: status !== "success",
                        tooltip:
                            "This will reload the plugin keeping any changes you made to the dashboard intact",
                    },
                    {
                        icon: "circle-cross",
                        onClick: togglePlugin,
                        id: "toggle-plugins",
                        disabled: status !== "success",
                        isActive: !isPluginEnabled,
                        tooltip:
                            "This will reload the dashboard with or without the plugin applied keeping any changes you made to the dashboard intact",
                    },
                ],
            },
        ];
    }, [isPluginEnabled, reloadPlugins, status, togglePlugin]);

    if (status === "loading") {
        return <LoadingComponent />;
    }

    if (status === "error" || result === undefined) {
        return <ErrorComponent message={error?.message ?? ""} />;
    }

    return <result.DashboardComponent {...result.props} toolbarGroups={toolbarGroups} />;
};
