// (C) 2021-2022 GoodData Corporation
import { SagaIterator } from "redux-saga";
import { call } from "redux-saga/effects";
import { IDateFilterConfig, IDashboardDateFilterConfig } from "@gooddata/sdk-model";

import { mergeDateFilterConfigs } from "../../../../_staging/dateFilterConfig/merge.js";
import { validateDateFilterConfig } from "../../../../_staging/dateFilterConfig/validation.js";
import { InitializeDashboard } from "../../../commands/dashboard.js";
import { DashboardContext } from "../../../types/commonTypes.js";
import { onDateFilterConfigValidationError } from "./onDateFilterConfigValidationError.js";

export interface DateFilterMergeResult {
    config: IDateFilterConfig;
    source: "workspace" | "dashboard";
}

export function* mergeDateFilterConfigWithOverrides(
    ctx: DashboardContext,
    cmd: InitializeDashboard,
    config: IDateFilterConfig,
    dashboardOverrides?: IDashboardDateFilterConfig,
): SagaIterator<DateFilterMergeResult> {
    if (!dashboardOverrides) {
        return {
            config,
            source: "workspace",
        } as DateFilterMergeResult;
    }

    const mergedConfig = mergeDateFilterConfigs(config, dashboardOverrides);
    /*
     * KD's validation logic did not include selected option. The validation of workspace-level configs was
     * doing that explicitly outside of validate logic. That logic was not part of the dashboard-level override
     * processing where just the plain validation was used.
     *
     * The flag below ensures matching behavior.
     */
    const mergedConfigValidation = validateDateFilterConfig(mergedConfig, false);

    if (mergedConfigValidation !== "Valid") {
        yield call(onDateFilterConfigValidationError, ctx, mergedConfigValidation, cmd.correlationId);

        return {
            config,
            source: "workspace",
        } as DateFilterMergeResult;
    }

    return {
        config: mergedConfig,
        source: "dashboard",
    } as DateFilterMergeResult;
}
