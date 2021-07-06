// (C) 2020-2021 GoodData Corporation

import { useDashboardCommandProcessing } from "../../dashboard/useDashboardCommandProcessing";
import {
    DashboardDrillToLegacyDashboardTriggered,
    DashboardCommandFailed,
    drillToLegacyDashboard,
} from "../../model";

/**
 * @internal
 */
export interface UseDrillToLegacyDashboardProps {
    onSuccess?: (event: DashboardDrillToLegacyDashboardTriggered) => void;
    onError?: (event: DashboardCommandFailed) => void;
    onBeforeRun?: () => void;
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
        successEvent: "GDC.DASH/EVT.DRILL.DRILL_TO_LEGACY_DASHBOARD.TRIGGERED",
        errorEvent: "GDC.DASH/EVT.COMMAND.FAILED",
        onSuccess,
        onError,
        onBeforeRun,
    });
};
