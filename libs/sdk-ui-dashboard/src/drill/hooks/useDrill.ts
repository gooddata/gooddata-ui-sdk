// (C) 2020-2021 GoodData Corporation

import { useDashboardCommandProcessing } from "../../dashboard/useDashboardCommandProcessing";
import { DashboardDrillTriggered, DashboardCommandFailed, drill } from "../../model";

/**
 * @internal
 */
export interface UseDrillProps {
    onSuccess?: (event: DashboardDrillTriggered) => void;
    onError?: (event: DashboardCommandFailed) => void;
    onBeforeRun?: () => void;
}

/**
 * @internal
 */
export const useDrill = ({ onSuccess, onError, onBeforeRun }: UseDrillProps) => {
    return useDashboardCommandProcessing({
        commandCreator: drill,
        successEvent: "GDC.DASH/EVT.DRILL.TRIGGERED",
        errorEvent: "GDC.DASH/EVT.COMMAND.FAILED",
        onSuccess,
        onError,
        onBeforeRun,
    });
};
