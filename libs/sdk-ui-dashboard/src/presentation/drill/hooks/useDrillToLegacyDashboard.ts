// (C) 2020-2025 GoodData Corporation
import {
    type DashboardCommandFailed,
    type DashboardDrillToLegacyDashboardResolved,
    type DrillToLegacyDashboard,
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
