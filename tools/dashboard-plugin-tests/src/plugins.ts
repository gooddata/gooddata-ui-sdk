// (C) 2019-2022 GoodData Corporation
import { ReferenceMd } from "@gooddata/reference-workspace";
import { createLocalTestPlugin, createLocalTestPluginLink } from "./utils";
import { LocalDashboardPluginsConfig } from "./types";

export const SIMPLE_DASHBOARD = ReferenceMd.Dashboards.SimpleDashboard;

export const TEST_PLUGIN = createLocalTestPlugin("test-plugin");

export const LOCAL_PLUGINS_CONFIG: LocalDashboardPluginsConfig = {
    plugins: [TEST_PLUGIN],
    links: {
        [SIMPLE_DASHBOARD]: [createLocalTestPluginLink(TEST_PLUGIN)],
    },
};
