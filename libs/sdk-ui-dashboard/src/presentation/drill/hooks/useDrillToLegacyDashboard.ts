// (C) 2020-2021 GoodData Corporation
import {
    DrillToLegacyDashboard,
    DashboardDrillToLegacyDashboardResolved,
    DashboardCommandFailed,
    drillToLegacyDashboard,
    useDashboardCommandProcessing,
} from "../../../model/index.js";

/**
 * @internal
 */
export interface UseDrillToLegacyDashboardProps {
    onSuccess?: (event: DashboardDrillToLegacyDashboardResolved) => void;
    onError?: (event: DashboardCommandFailed<DrillToLegacyDashboard>) => void;
    onBeforeRun?: (cmd: DrillToLegacyDashboard) => void;
}

/**
 * @internal
 */
export const useDrillToLegacyDashboard = ({
    onSuccess,
    onError,
    onBeforeRun,
}: UseDrillToLegacyDashboardProps = {}) => {
    return useDashboardCommandProcessing({
        commandCreator: drillToLegacyDashboard,
        successEvent: "GDC.DASH/EVT.DRILL.DRILL_TO_LEGACY_DASHBOARD.RESOLVED",
        errorEvent: "GDC.DASH/EVT.COMMAND.FAILED",
        onSuccess,
        onError,
        onBeforeRun,
    });
};
