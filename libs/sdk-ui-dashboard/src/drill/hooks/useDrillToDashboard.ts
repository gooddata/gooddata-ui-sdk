// (C) 2020-2021 GoodData Corporation

import { useDashboardCommandProcessing } from "../../dashboardAux";
import { DashboardDrillToDashboardTriggered, DashboardCommandFailed, drillToDashboard } from "../../model";

/**
 * @internal
 */
export interface UseDrillToDashboardProps {
    onSuccess?: (event: DashboardDrillToDashboardTriggered) => void;
    onError?: (event: DashboardCommandFailed) => void;
    onBeforeRun?: () => void;
}

/**
 * @internal
 */
export const useDrillToDashboard = ({ onSuccess, onError, onBeforeRun }: UseDrillToDashboardProps = {}) => {
    return useDashboardCommandProcessing({
        commandCreator: drillToDashboard,
        successEvent: "GDC.DASH/EVT.DRILL.DRILL_TO_DASHBOARD.TRIGGERED",
        errorEvent: "GDC.DASH/EVT.COMMAND.FAILED",
        onSuccess,
        onError,
        onBeforeRun,
    });
};
