// (C) 2019-2022 GoodData Corporation
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { withCustomWorkspaceSettings } from "@gooddata/sdk-backend-base";

/**
 * We need this, because user that is logged in for refreshing the recordings of the tests can have different FF,
 * than we need in the tests.
 */
export function withTestWorkspaceSettings(backend: IAnalyticalBackend): IAnalyticalBackend {
    return withCustomWorkspaceSettings(backend, {
        commonSettingsWrapper: (settings) => ({
            ...settings,
            enableKDWidgetCustomHeight: true,
        }),
    });
}
