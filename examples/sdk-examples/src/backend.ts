// (C) 2019-2022 GoodData Corporation
import bearFactory, { AnonymousAuthProvider } from "@gooddata/sdk-backend-bear";
import {
    withCaching,
    withCustomWorkspaceSettings,
    RecommendedCachingConfiguration,
} from "@gooddata/sdk-backend-base";
import { ISettings } from "@gooddata/sdk-model";

const authProvider = new AnonymousAuthProvider();

const customSettings = {
    commonSettingsWrapper: (settings: ISettings) => ({
        ...(settings ?? {}),
        enableNewHeadline: true,
    }),
};

const customSettingBackend = withCustomWorkspaceSettings(
    bearFactory().withAuthentication(authProvider),
    customSettings,
);

export const backend = withCaching(customSettingBackend, RecommendedCachingConfiguration);
