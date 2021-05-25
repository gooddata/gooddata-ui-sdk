// (C) 2021 GoodData Corporation
import includes from "lodash/includes";
import { DashboardConfig, DashboardContext } from "../../types/commonTypes";
import { IDateFilterConfigsQueryResult, IWorkspaceSettings } from "@gooddata/sdk-backend-spi";
import { LoadDashboard } from "../../commands/dashboard";
import { all, call } from "redux-saga/effects";
import { dateFilterValidationFailed } from "../../events/dashboard";
import { defaultDateFilterConfig } from "./defaultDateFilterConfig";
import {
    DateFilterConfigValidationResult,
    filterOutWeeks,
    validateDateFilterConfig,
} from "../../_staging/dateFilterConfig";
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

const FallbackToDefault: DateFilterConfigValidationResult[] = [
    "NoConfigProvided",
    "ConflictingIdentifiers",
    "NoVisibleOptions",
];

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
        yield call(
            eventDispatcher,
            dateFilterValidationFailed(ctx, "TOO_MANY_PROJECT_CONFIGS", cmd.correlationId),
        );
    }

    // There may be no date filter config on backend, fall back to default
    const loadedConfig = dateFilterConfigResult?.items[0] ?? defaultDateFilterConfig;
    // Validate the config as it is possible to construct & upload the config incorrectly
    const configValidation = validateDateFilterConfig(loadedConfig);
    // Some validation errors mean the config is useless and code should fall back to default anyway
    const validConfig = !includes(FallbackToDefault, configValidation)
        ? loadedConfig
        : defaultDateFilterConfig;
    // Finally, if week filtering is disabled, ensure that the respective presets are not present
    const dateFilterConfig = !settings.enableWeekFilters ? filterOutWeeks(validConfig) : validConfig;

    if (configValidation !== "Valid") {
        yield call(eventDispatcher, dateFilterValidationFailed(ctx, configValidation, cmd.correlationId));
    }

    return {
        dateFilterConfig,
        settings,
        colorPalette,
    } as DashboardConfig;
}
