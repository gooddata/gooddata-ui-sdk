// (C) 2021 GoodData Corporation
import includes from "lodash/includes";
import { DashboardConfig, DashboardContext } from "../../types/commonTypes";
import {
    IDateFilterConfig,
    IDateFilterConfigsQueryResult,
    ISettings,
    IWorkspaceSettings,
} from "@gooddata/sdk-backend-spi";
import { LoadDashboard } from "../../commands/dashboard";
import { all, call } from "redux-saga/effects";
import { dateFilterValidationFailed } from "../../events/dashboard";
import { defaultDateFilterConfig } from "../../_staging/dateFilterConfig/defaultConfig";
import {
    DateFilterConfigValidationResult,
    filterOutWeeks,
    validateDateFilterConfig,
} from "../../_staging/dateFilterConfig/validation";
import { eventDispatcher } from "../../eventEmitter/eventDispatcher";
import { IColorPalette } from "@gooddata/sdk-model";
import { PromiseFnReturnType } from "../../types/sagas";

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

function loadSettingsForCurrentUser(ctx: DashboardContext): Promise<IWorkspaceSettings> {
    const { backend, workspace } = ctx;

    return backend.workspace(workspace).settings().getSettingsForCurrentUser();
}

function loadColorPalette(ctx: DashboardContext): Promise<IColorPalette> {
    const { backend, workspace } = ctx;

    return backend.workspace(workspace).styling().getColorPalette();
}

const FallbackToDefault: DateFilterConfigValidationResult[] = ["ConflictingIdentifiers", "NoVisibleOptions"];

/**
 * Given the date filter config loaded from backend and the settings, this function will perform validation
 * of the config and if needed also cleanup of invalid/disabled presents
 *
 */
function getValidDateFilterConfig(
    config: IDateFilterConfig,
    settings: ISettings,
): [IDateFilterConfig, DateFilterConfigValidationResult] {
    const configValidation = validateDateFilterConfig(config);
    const validConfig = !includes(FallbackToDefault, configValidation) ? config : defaultDateFilterConfig;

    const dateFilterConfig = !settings.enableWeekFilters ? filterOutWeeks(validConfig) : validConfig;

    return [dateFilterConfig, configValidation];
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
        dateFilterConfig,
        settings,
        colorPalette,
    } as DashboardConfig;
}
