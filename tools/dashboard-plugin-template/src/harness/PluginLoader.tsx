// (C) 2019-2022 GoodData Corporation
import React, { useCallback, useMemo, useState } from "react";
import { IDashboard, idRef, ObjRef } from "@gooddata/sdk-model";
import { DashboardLoadStatus, IEmbeddedPlugin, useDashboardLoader } from "@gooddata/sdk-ui-loaders";
import PluginFactory from "../plugin";
import { DEFAULT_DASHBOARD_ID } from "./constants";
import {
    DashboardConfig,
    RenderMode,
    selectDashboardWorkingDefinition,
    selectRenderMode,
    SingleDashboardStoreAccessor,
} from "@gooddata/sdk-ui-dashboard";
import { ErrorComponent, LoadingComponent } from "@gooddata/sdk-ui";
import { Toolbar } from "./Toolbar";

const Plugins: IEmbeddedPlugin[] = [{ factory: PluginFactory }];
const Config: DashboardConfig = {
    mapboxToken: process.env.MAPBOX_TOKEN,
};
const dashboardRef = idRef(process.env.DASHBOARD_ID || DEFAULT_DASHBOARD_ID, "analyticalDashboard");

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

    return (
        <result.DashboardComponent
            {...result.props}
            onStateChange={(state, dispatch) => {
                SingleDashboardStoreAccessor.getOnChangeHandler()(state, dispatch);
                result.props.onStateChange?.(state, dispatch);
            }}
        />
    );
};

export const PluginLoader = () => {
    const [dashboard, setDashboard] = useState<IDashboard | ObjRef>(dashboardRef);
    const [renderMode, setRenderMode] = useState<RenderMode>("view");

    const augmentedConfig = useMemo(() => ({ ...Config, initialRenderMode: renderMode }), [renderMode]);

    const loaderStatus = useDashboardLoader({
        dashboard,
        loadingMode: "staticOnly",
        config: augmentedConfig,
        extraPlugins: Plugins,
    });

    const onReload = useCallback(() => {
        const select = SingleDashboardStoreAccessor.getDashboardSelect();
        const dashboardObject = select(selectDashboardWorkingDefinition);
        const renderMode = select(selectRenderMode);
        setDashboard(dashboardObject as any);
        setRenderMode(renderMode);
    }, []);

    return (
        <>
            <Toolbar onReloadPlugin={onReload} reloadDisabled={loaderStatus.status !== "success"} />
            <PluginLoaderBody loaderStatus={loaderStatus} />
        </>
    );
};
