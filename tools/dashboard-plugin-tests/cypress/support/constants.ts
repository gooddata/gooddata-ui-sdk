// (C) 2021 GoodData Corporation
import * as Md from "../../md/full";
import { newTestPlugin, newTestPluginLink } from "./plugins";

export const getHost = (): string => Cypress.env("HOST");

export const getWorkspaceId = (): string => Cypress.env("WORKSPACE");

export const getUsername = (): string => Cypress.env("USERNAME");

export const getMockServer = (): string => Cypress.env("CYPRESS_MOCK_SERVER");

export const getPassword = (): string => Cypress.env("PASSWORD");

export const PLUGIN_8_8_0 = newTestPlugin("plugin-8.8.0");
export const PLUGIN_LATEST = newTestPlugin("plugin-latest");
export const DASHBOARD_WITH_PLUGIN = Md.Dashboards.DashboardWithPlugin;

export const PLUGIN_8_8_0_CONFIG = {
    dashboardId: DASHBOARD_WITH_PLUGIN,
    plugins: [PLUGIN_8_8_0],
    links: [newTestPluginLink(PLUGIN_8_8_0)],
};

export const PLUGIN_LATEST_CONFIG = {
    dashboardId: DASHBOARD_WITH_PLUGIN,
    plugins: [PLUGIN_LATEST],
    links: [newTestPluginLink(PLUGIN_LATEST)],
};
