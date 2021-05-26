// (C) 2021 GoodData Corporation
import { DashboardContext, ResolvedDashboardConfig } from "../../types/commonTypes";
import { IDateFilterConfigsQueryResult, IUserWorkspaceSettings } from "@gooddata/sdk-backend-spi";
import { LoadDashboard } from "../../commands/dashboard";
import { all, call } from "redux-saga/effects";
import { dateFilterValidationFailed } from "../../events/dashboard";
import { defaultDateFilterConfig } from "../../_staging/dateFilterConfig/defaultConfig";
import { eventDispatcher } from "../../eventEmitter/eventDispatcher";
import { IColorPalette } from "@gooddata/sdk-model";
import { PromiseFnReturnType } from "../../types/sagas";
import { ILocale } from "@gooddata/sdk-ui";
import { getValidDateFilterConfig } from "../../_staging/dateFilterConfig/validation";
import { stripUserAndWorkspaceProps } from "../../_staging/settings/conversion";

function loadDateFilterConfig(ctx: DashboardContext): Promise<IDateFilterConfigsQueryResult | undefined> {
    const { backend, workspace } = ctx;

    return backend
        .workspace(workspace)
        .dateFilterConfigs()
        .withLimit(1)
        .query()
        .catch((_) => {
            // TODO: add log
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

/**
 * Loads all essential dashboard configuration from the backend if needed. The load command may specify their
 * own inline config - if that is the case the config is bounced back immediately. Otherwise the necessary
 * backend queries and post-processing is done.
 *
 * @param ctx
 * @param cmd
 */
export function* loadDashboardConfig(ctx: DashboardContext, cmd: LoadDashboard) {
    const {
        payload: { config },
    } = cmd;

    if (config) {
        return config;
    }

    const [dateFilterConfigResult, settings, colorPalette]: [
        PromiseFnReturnType<typeof loadDateFilterConfig>,
        PromiseFnReturnType<typeof loadSettingsForCurrentUser>,
        PromiseFnReturnType<typeof loadColorPalette>,
    ] = yield all([
        call(loadDateFilterConfig, ctx),
        call(loadSettingsForCurrentUser, ctx),
        call(loadColorPalette, ctx),
    ]);

    if ((dateFilterConfigResult?.totalCount ?? 0) > 1) {
        yield call(eventDispatcher, dateFilterValidationFailed(ctx, "TOO_MANY_CONFIGS", cmd.correlationId));
    }

    const firstConfig = dateFilterConfigResult?.items[0];

    if (!firstConfig) {
        yield call(eventDispatcher, dateFilterValidationFailed(ctx, "NO_CONFIG", cmd.correlationId));
    }

    const [dateFilterConfig, configValidation] = getValidDateFilterConfig(
        firstConfig ?? defaultDateFilterConfig,
        settings,
    );

    if (configValidation !== "Valid") {
        yield call(eventDispatcher, dateFilterValidationFailed(ctx, configValidation, cmd.correlationId));
    }

    return {
        locale: settings.locale as ILocale,
        separators: settings.separators,
        dateFilterConfig,
        settings: stripUserAndWorkspaceProps(settings),
        colorPalette,
    } as ResolvedDashboardConfig;
}
