// (C) 2019-2022 GoodData Corporation
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { ISettings } from "@gooddata/sdk-model";
import { withCustomWorkspaceSettings } from "@gooddata/sdk-backend-base";
import { IDashboardPluginTestConfig } from "./setup";

const defaultSettings: ISettings = {
    enableKDWidgetCustomHeight: true,
    enableTableColumnsManualResizing: true,
    enableTableColumnsAutoResizing: true,
    enableTableColumnsGrowToFit: true,
};

/**
 * We need this, because user that is logged in for refreshing the recordings of the tests can have different FF,
 * than we need in the tests.
 *
 * @internal
 */
export function withTestSettings(config: IDashboardPluginTestConfig) {
    return function decorate(backend: IAnalyticalBackend): IAnalyticalBackend {
        return withCustomWorkspaceSettings(backend, {
            commonSettingsWrapper: (settings) => ({
                ...settings,
                ...defaultSettings,
                ...(config.settings ?? {}),
            }),
        });
    };
}
