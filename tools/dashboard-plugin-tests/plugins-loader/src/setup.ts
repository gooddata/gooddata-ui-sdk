// (C) 2021-2022 GoodData Corporation
import {
    IDashboardPlugin,
    IDashboardPluginLink,
    ISettings,
    UnexpectedError,
} from "@gooddata/sdk-backend-spi";

// Test configuration
declare global {
    interface Window {
        ["DASHBOARD_PLUGIN_TEST_CONFIG"]: IDashboardPluginTestConfig; // Add index signature
    }
}

/**
 * @internal
 */
export interface IDashboardPluginTestConfig {
    dashboardId: string;
    links: IDashboardPluginLink[];
    plugins: IDashboardPlugin[];
    settings?: ISettings;
}

/**
 * @internal
 */
export function setupDashboardPluginTest(win: Window, config: IDashboardPluginTestConfig): void {
    win["DASHBOARD_PLUGIN_TEST_CONFIG"] = config;
}

/**
 * @internal
 */
export function getDashboardPluginTestConfig(win: Window): IDashboardPluginTestConfig {
    const testConfig = win["DASHBOARD_PLUGIN_TEST_CONFIG"];
    if (!testConfig) {
        throw new UnexpectedError("Test configuration not found!");
    }

    return testConfig;
}
