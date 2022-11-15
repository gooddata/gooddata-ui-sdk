// (C) 2019-2022 GoodData Corporation
import React, { useMemo } from "react";
import { idRef } from "@gooddata/sdk-model";
import { IEmbeddedPlugin, useDashboardLoaderWithReload } from "@gooddata/sdk-ui-loaders";
import PluginFactory from "../plugin";
import { DEFAULT_DASHBOARD_ID } from "./constants";
import { DashboardConfig } from "@gooddata/sdk-ui-dashboard";
import { ErrorComponent, LoadingComponent } from "@gooddata/sdk-ui";

const Plugins: IEmbeddedPlugin[] = [{ factory: PluginFactory }];
const Config: DashboardConfig = { mapboxToken: process.env.MAPBOX_TOKEN };
const DashboardRef = idRef(process.env.DASHBOARD_ID || DEFAULT_DASHBOARD_ID, "analyticalDashboard");

export const PluginLoader = () => {
    const { loaderStatus, reloadPlugins } = useDashboardLoaderWithReload({
        dashboard: DashboardRef,
        loadingMode: "staticOnly",
        config: Config,
        extraPlugins: Plugins,
    });

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
                ],
            },
        ];
    }, [reloadPlugins, status]);

    if (status === "loading") {
        return <LoadingComponent />;
    }

    if (status === "error" || result === undefined) {
        return <ErrorComponent message={error?.message ?? ""} />;
    }

    return <result.DashboardComponent {...result.props} toolbarGroups={toolbarGroups} />;
};
