// (C) 2019-2021 GoodData Corporation
import React from "react";
import { idRef } from "@gooddata/sdk-model";
import { DashboardStub, IEmbeddedPlugin } from "@gooddata/sdk-ui-loaders";
import PluginFactory from "../plugin";
import { DEFAULT_DASHBOARD_ID } from "./constants";

const ExtraPlugins: IEmbeddedPlugin[] = [{ factory: PluginFactory }];

export const PluginLoader = (): JSX.Element => {
    return (
        <DashboardStub
            dashboard={idRef(process.env.DASHBOARD_ID ?? DEFAULT_DASHBOARD_ID)}
            loadingMode="staticOnly"
            extraPlugins={ExtraPlugins}
        />
    );
};
