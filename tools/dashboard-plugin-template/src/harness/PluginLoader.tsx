// (C) 2019-2021 GoodData Corporation
import React from "react";
import { idRef } from "@gooddata/sdk-model";
import { DashboardStub, IEmbeddedPlugin } from "@gooddata/sdk-ui-loaders";
import PluginFactory from "../plugin";

const ExtraPlugins: IEmbeddedPlugin[] = [{ factory: PluginFactory }];

export const PluginLoader = (): JSX.Element => {
    return (
        <DashboardStub
            dashboard={idRef("aeO5PVgShc0T")}
            loadingMode="staticOnly"
            extraPlugins={ExtraPlugins}
        />
    );
};
