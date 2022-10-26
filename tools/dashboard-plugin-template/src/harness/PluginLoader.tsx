// (C) 2019-2022 GoodData Corporation
import React from "react";
import { idRef } from "@gooddata/sdk-model";
import { DashboardLoadStatus, IEmbeddedPlugin, useDashboardLoaderWithReload } from "@gooddata/sdk-ui-loaders";
import PluginFactory from "../plugin";
import { DEFAULT_DASHBOARD_ID } from "./constants";
import { DashboardConfig } from "@gooddata/sdk-ui-dashboard";
import { ErrorComponent, LoadingComponent } from "@gooddata/sdk-ui";
import { Toolbar } from "./Toolbar";

const Plugins: IEmbeddedPlugin[] = [{ factory: PluginFactory }];
const Config: DashboardConfig = { mapboxToken: process.env.MAPBOX_TOKEN };
const DashboardRef = idRef(process.env.DASHBOARD_ID || DEFAULT_DASHBOARD_ID, "analyticalDashboard");

interface IPluginLoaderBodyProps {
    loaderStatus: DashboardLoadStatus;
}

const PluginLoaderBody: React.FC<IPluginLoaderBodyProps> = (props) => {
    const { status, error, result } = props.loaderStatus;

    if (status === "loading") {
        return <LoadingComponent />;
    }

    if (status === "error" || result === undefined) {
        return <ErrorComponent message={error?.message ?? ""} />;
    }

    return <result.DashboardComponent {...result.props} />;
};

export const PluginLoader = () => {
    const { loaderStatus, reloadPlugins } = useDashboardLoaderWithReload({
        dashboard: DashboardRef,
        loadingMode: "staticOnly",
        config: Config,
        extraPlugins: Plugins,
    });

    return (
        <>
            <Toolbar onReloadPlugin={reloadPlugins} reloadDisabled={loaderStatus.status !== "success"} />
            <PluginLoaderBody loaderStatus={loaderStatus} />
        </>
    );
};
