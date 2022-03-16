// (C) 2019-2022 GoodData Corporation
import React from "react";
import { idRef } from "@gooddata/sdk-model";
import { DashboardStub, IEmbeddedPlugin } from "@gooddata/sdk-ui-loaders";
import PluginFactory from "../dp_plugin_latest";
import { DEFAULT_DASHBOARD_ID } from "./constants";
import { DashboardConfig } from "@gooddata/sdk-ui-dashboard";

const Plugins: IEmbeddedPlugin[] = [{ factory: PluginFactory }];
const Config: DashboardConfig = {
    mapboxToken: process.env.MAPBOX_TOKEN,
};

export const PluginLoader = (): JSX.Element => {
    return (
        <DashboardStub
            dashboard={idRef(process.env.DASHBOARD_ID ?? DEFAULT_DASHBOARD_ID)}
            loadingMode="staticOnly"
            config={Config}
            extraPlugins={Plugins}
        />
    );
};
