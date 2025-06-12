// (C) 2020-2021 GoodData Corporation

import {
    DashboardDrillToDashboardResolved,
    DashboardCommandFailed,
    drillToDashboard,
    useDashboardCommandProcessing,
    DrillToDashboard,
} from "../../../model/index.js";

/**
 * @internal
 */
export interface UseDrillToDashboardProps {
    onSuccess?: (event: DashboardDrillToDashboardResolved) => void;
    onError?: (event: DashboardCommandFailed<DrillToDashboard>) => void;
    onBeforeRun?: (cmd: DrillToDashboard) => void;
}

/**
 * @internal
 */
export const useDrillToDashboard = ({ onSuccess, onError, onBeforeRun }: UseDrillToDashboardProps = {}) => {
    return useDashboardCommandProcessing({
        commandCreator: drillToDashboard,
        successEvent: "GDC.DASH/EVT.DRILL.DRILL_TO_DASHBOARD.RESOLVED",
        errorEvent: "GDC.DASH/EVT.COMMAND.FAILED",
        onSuccess,
        onError,
        onBeforeRun,
    });
};
