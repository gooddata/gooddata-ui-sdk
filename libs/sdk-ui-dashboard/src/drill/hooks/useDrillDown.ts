// (C) 2020-2021 GoodData Corporation

import { useDashboardCommandProcessing } from "../../dashboardAux";
import { DashboardDrillDownTriggered, DashboardCommandFailed, drillDown } from "../../model";

/**
 * @internal
 */
export interface UseDrillDownProps {
    onSuccess?: (event: DashboardDrillDownTriggered) => void;
    onError?: (event: DashboardCommandFailed) => void;
    onBeforeRun?: () => void;
}

/**
 * @internal
 */
export const useDrillDown = ({ onSuccess, onError, onBeforeRun }: UseDrillDownProps = {}) => {
    return useDashboardCommandProcessing({
        commandCreator: drillDown,
        successEvent: "GDC.DASH/EVT.DRILL.DRILL_DOWN.TRIGGERED",
        errorEvent: "GDC.DASH/EVT.COMMAND.FAILED",
        onSuccess,
        onError,
        onBeforeRun,
    });
};
