// (C) 2021-2023 GoodData Corporation
import { SagaIterator } from "redux-saga";
import { all, call, put } from "redux-saga/effects";
import { IDateFilterConfigsQueryResult, IUserWorkspaceSettings } from "@gooddata/sdk-backend-spi";
import { ILocale, resolveLocale } from "@gooddata/sdk-ui";
import { IColorPalette, ISeparators, ISettings } from "@gooddata/sdk-model";

import { defaultDateFilterConfig } from "../../../../_staging/dateFilterConfig/defaultConfig.js";
import { getValidDateFilterConfig } from "../../../../_staging/dateFilterConfig/validation.js";
import { stripUserAndWorkspaceProps } from "../../../../_staging/settings/conversion.js";
import { InitializeDashboard } from "../../../commands/index.js";
import { dateFilterConfigActions } from "../../../store/dateFilterConfig/index.js";
import {
    DashboardConfig,
    DashboardContext,
    isResolvedConfig,
    ResolvedDashboardConfig,
} from "../../../types/commonTypes.js";
import { PromiseFnReturnType } from "../../../types/sagas.js";
import { sanitizeUnfinishedFeatureSettings } from "./sanitizeUnfinishedFeatureSettings.js";
import { onDateFilterConfigValidationError } from "./onDateFilterConfigValidationError.js";

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

function loadColorPalette(ctx: DashboardContext): Promise<IColorPalette> {
    const { backend, workspace } = ctx;

    return backend.workspace(workspace).styling().getColorPalette();
}

function* resolveDateFilterConfig(ctx: DashboardContext, config: DashboardConfig, cmd: InitializeDashboard) {
    if (config.dateFilterConfig !== undefined) {
        return config.dateFilterConfig;
    }

    const result: PromiseFnReturnType<typeof loadDateFilterConfig> = yield call(loadDateFilterConfig, ctx);

    if ((result?.totalCount ?? 0) > 1) {
        yield call(onDateFilterConfigValidationError, ctx, "TOO_MANY_CONFIGS", cmd.correlationId);
    }

    const firstConfig = result?.items[0];

    if (!firstConfig) {
        yield call(onDateFilterConfigValidationError, ctx, "NO_CONFIG", cmd.correlationId);
    }

    return result?.items[0] ?? defaultDateFilterConfig;
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
        widgetsOverlay: config.widgetsOverlay ?? {},
    };
}
