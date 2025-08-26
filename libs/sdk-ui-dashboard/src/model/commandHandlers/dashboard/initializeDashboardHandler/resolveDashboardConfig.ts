// (C) 2021-2025 GoodData Corporation
import includes from "lodash/includes.js";
import { SagaIterator } from "redux-saga";
import { all, call, put } from "redux-saga/effects";

import { IDateFilterConfigsQueryResult, IUserWorkspaceSettings } from "@gooddata/sdk-backend-spi";
import { IColorPalette, IDateFilterConfig, ISeparators, ISettings } from "@gooddata/sdk-model";
import { ILocale, resolveLocale } from "@gooddata/sdk-ui";

import { onDateFilterConfigValidationError } from "./onDateFilterConfigValidationError.js";
import { sanitizeUnfinishedFeatureSettings } from "./sanitizeUnfinishedFeatureSettings.js";
import { defaultDateFilterConfig } from "../../../../_staging/dateFilterConfig/defaultConfig.js";
import {
    FallbackToDefault,
    getValidDateFilterConfig,
    validateDateFilterConfig,
} from "../../../../_staging/dateFilterConfig/validation.js";
import { stripUserAndWorkspaceProps } from "../../../../_staging/settings/conversion.js";
import { InitializeDashboard } from "../../../commands/index.js";
import { dateFilterConfigActions } from "../../../store/dateFilterConfig/index.js";
import {
    DashboardConfig,
    DashboardContext,
    ResolvedDashboardConfig,
    isResolvedConfig,
} from "../../../types/commonTypes.js";
import { PromiseFnReturnType } from "../../../types/sagas.js";
import { loadAutomationsData } from "../common/loadAutomationsData.js";

function loadDateFilterConfig(ctx: DashboardContext): Promise<IDateFilterConfigsQueryResult | undefined> {
    const { backend, workspace } = ctx;

    return backend
        .workspace(workspace)
        .dateFilterConfigs()
        .withLimit(1)
        .query()
        .catch((e) => {
            // eslint-disable-next-line no-console
            console.log(
                "An error has occurred while loading date filter config. Will fall back to default date filter config.",
                e,
            );

            return undefined;
        });
}

function loadSettingsForCurrentUser(ctx: DashboardContext): Promise<IUserWorkspaceSettings> {
    const { backend, workspace } = ctx;

    return backend.workspace(workspace).settings().getSettingsForCurrentUser();
}

///
async function loadCustomDateFilterConfig(ctx: DashboardContext): Promise<IDateFilterConfig | undefined> {
    const { backend, workspace } = ctx;

    const customDateFilterConfig = await backend
        .workspace(workspace)
        .dateFilterConfigs()
        .withLimit(1)
        .queryCustomDateFilterConfig();

    if (!customDateFilterConfig.items[0]) {
        return undefined;
    }

    const configValidation = validateDateFilterConfig(customDateFilterConfig.items[0]);

    const validConfig = !includes(FallbackToDefault, configValidation);

    return validConfig ? customDateFilterConfig.items[0] : undefined;
}

function loadColorPalette(ctx: DashboardContext): Promise<IColorPalette> {
    const { backend, workspace } = ctx;

    return backend.workspace(workspace).styling().getColorPalette();
}

function* resolveDateFilterConfig(ctx: DashboardContext, config: DashboardConfig, cmd: InitializeDashboard) {
    if (config.dateFilterConfig) {
        return config.dateFilterConfig;
    } else if (config?.settings?.dateFilterConfig) {
        return config.settings.dateFilterConfig;
    }

    const customDateFilterConfig: PromiseFnReturnType<typeof loadCustomDateFilterConfig> = yield call(
        loadCustomDateFilterConfig,
        ctx,
    );

    if (customDateFilterConfig) {
        return customDateFilterConfig;
    } else {
        const result: PromiseFnReturnType<typeof loadDateFilterConfig> = yield call(
            loadDateFilterConfig,
            ctx,
        );

        if ((result?.totalCount ?? 0) > 1) {
            yield call(onDateFilterConfigValidationError, ctx, "TOO_MANY_CONFIGS", cmd.correlationId);
        }

        const firstConfig = result?.items[0];

        if (!firstConfig) {
            yield call(onDateFilterConfigValidationError, ctx, "NO_CONFIG", cmd.correlationId);
        }

        return result?.items[0] ?? defaultDateFilterConfig;
    }
}

type UserSettings = {
    locale: ILocale;
    separators: ISeparators;
    settings: ISettings;
};

function resolveUserSettings(ctx: DashboardContext, config: DashboardConfig): Promise<UserSettings> {
    if (config.settings && config.locale && config.separators) {
        return Promise.resolve({
            locale: config.locale,
            separators: config.separators,
            settings: config.settings,
        });
    }

    return loadSettingsForCurrentUser(ctx).then((res) => ({
        locale: config.locale ?? resolveLocale(res.locale),
        separators: config.separators ?? res.separators,
        settings: config.settings ?? stripUserAndWorkspaceProps(res),
    }));
}

function resolveColorPalette(ctx: DashboardContext, config: DashboardConfig): Promise<IColorPalette> {
    if (config.colorPalette) {
        return Promise.resolve(config.colorPalette);
    }

    return loadColorPalette(ctx);
}

/**
 * Loads all essential dashboard configuration from the backend if needed. The load command may specify their
 * own inline config - if that is the case the config is bounced back immediately. Otherwise, the necessary
 * backend queries and post-processing is done.
 */
export function* resolveDashboardConfig(
    ctx: DashboardContext,
    cmd: InitializeDashboard,
): SagaIterator<ResolvedDashboardConfig> {
    const {
        payload: { config = {} },
    } = cmd;

    yield put(dateFilterConfigActions.clearDateFilterConfigValidationWarning());

    if (isResolvedConfig(config)) {
        /*
         * Config coming in props is fully specified. There is nothing to do. Bail out immediately.
         */
        if (config.allowUnfinishedFeatures || !config.settings) {
            return applyConfigDefaults(config);
        }
        return {
            ...applyConfigDefaults(config),
            settings: sanitizeUnfinishedFeatureSettings(config.settings),
        };
    }

    /*
     * Resolve the config values. The resolve* functions will take value from config if it is defined,
     * otherwise they will obtain the config from backend.
     *
     * Note: the user settings include locale, separators and the ISettings that should be in effect
     * for the current user in the context of the workspace.
     */

    const [dateFilterConfig, settings, colorPalette]: [
        PromiseFnReturnType<typeof resolveDateFilterConfig>,
        PromiseFnReturnType<typeof resolveUserSettings>,
        PromiseFnReturnType<typeof resolveColorPalette>,
    ] = yield all([
        call(resolveDateFilterConfig, ctx, config, cmd),
        call(resolveUserSettings, ctx, config),
        call(resolveColorPalette, ctx, config),
    ]);

    const [validDateFilterConfig, configValidation] = getValidDateFilterConfig(
        dateFilterConfig,
        settings.settings,
    );

    if (configValidation !== "Valid") {
        yield call(onDateFilterConfigValidationError, ctx, configValidation, cmd.correlationId);
    }

    const configWithDefaults = applyConfigDefaults(config);

    return {
        ...configWithDefaults,
        locale: settings.locale,
        separators: settings.separators,
        dateFilterConfig: validDateFilterConfig,
        settings: configWithDefaults.allowUnfinishedFeatures
            ? settings.settings
            : sanitizeUnfinishedFeatureSettings(settings.settings),
        colorPalette,
        mapboxToken: config.mapboxToken,
        agGridToken: config.agGridToken,
    };
}

function applyConfigDefaults<T extends DashboardConfig>(config: T) {
    return {
        ...config,
        objectAvailability: config.objectAvailability ?? {},
        isReadOnly: config.isReadOnly ?? false,
        isEmbedded: config.isEmbedded ?? false,
        isExport: config.isExport ?? false,
        isWhiteLabeled: config.isWhiteLabeled ?? false,
        disableDefaultDrills: config.disableDefaultDrills ?? false,
        enableFilterValuesResolutionInDrillEvents: config.enableFilterValuesResolutionInDrillEvents ?? false,
        menuButtonItemsVisibility: config.menuButtonItemsVisibility ?? {},
        allowUnfinishedFeatures: config.allowUnfinishedFeatures ?? false,
        allowCreateInsightRequest: config.allowCreateInsightRequest ?? false,
        initialRenderMode: config.initialRenderMode ?? "view",
        hideSaveAsNewButton: config.hideSaveAsNewButton ?? false,
        hideShareButton: config.hideShareButton ?? false,
        disableCrossFiltering: config.disableCrossFiltering ?? false,
        disableUserFilterReset: config.disableUserFilterReset ?? false,
        widgetsOverlay: config.widgetsOverlay ?? {},
        externalRecipient: config.externalRecipient ?? undefined,
    };
}

/**
 * Resolves dashboard config
 */
export function* resolveDashboardConfigAndFeatureFlagDependentCalls(
    ctx: DashboardContext,
    cmd: InitializeDashboard,
): SagaIterator<{
    resolvedConfig: ResolvedDashboardConfig;
    additionalData: {
        notificationChannelsCount: number;
        workspaceAutomationsCount: number;
    };
}> {
    const resolvedConfig = yield call(resolveDashboardConfig, ctx, cmd);
    const additionalData = yield call(loadAutomationsData, ctx, resolvedConfig.settings);

    return {
        resolvedConfig,
        additionalData,
    };
}
