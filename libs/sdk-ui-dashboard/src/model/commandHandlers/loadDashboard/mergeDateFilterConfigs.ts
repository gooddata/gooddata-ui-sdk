// (C) 2021 GoodData Corporation
import { IDashboardDateFilterConfig, IDateFilterConfig } from "@gooddata/sdk-backend-spi";
import { DashboardContext } from "../../types/commonTypes";
import { LoadDashboard } from "../../commands/dashboard";
import { mergeDateFilterConfigs } from "../../_staging/dateFilterConfig/merge";
import { validateDateFilterConfig } from "../../_staging/dateFilterConfig/validation";
import { dispatchDashboardEvent } from "../../eventEmitter/eventDispatcher";
import { dateFilterValidationFailed } from "../../events/dashboard";

export type DateFilterMergeResult = {
    config: IDateFilterConfig;
    source: "workspace" | "dashboard";
};

export function* mergeDateFilterConfigWithOverrides(
    ctx: DashboardContext,
    cmd: LoadDashboard,
    config: IDateFilterConfig,
    dashboardOverrides?: IDashboardDateFilterConfig,
) {
    if (!dashboardOverrides) {
        return {
            config,
            source: "workspace",
        };
    }

    const mergedConfig = mergeDateFilterConfigs(config, dashboardOverrides);
    /*
     * KD's validation logic did not include selected option. The validation of workspace-level configs was
     * doing that explicitly outside of validate logic. That logic was not par of the dashboard-level override
     * processing where just the plaing validation was used.
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
