// (C) 2021 GoodData Corporation
import { SagaIterator } from "redux-saga";
import { IDashboardDateFilterConfig, IDateFilterConfig } from "@gooddata/sdk-backend-spi";

import { mergeDateFilterConfigs } from "../../../../_staging/dateFilterConfig/merge";
import { validateDateFilterConfig } from "../../../../_staging/dateFilterConfig/validation";
import { InitializeDashboard } from "../../../commands/dashboard";
import { dispatchDashboardEvent } from "../../../store/_infra/eventDispatcher";
import { dateFilterValidationFailed } from "../../../events/dashboard";
import { DashboardContext } from "../../../types/commonTypes";

export type DateFilterMergeResult = {
    config: IDateFilterConfig;
    source: "workspace" | "dashboard";
};

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
        yield dispatchDashboardEvent(
            dateFilterValidationFailed(ctx, mergedConfigValidation, cmd.correlationId),
        );

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
