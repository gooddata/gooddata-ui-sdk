// (C) 2020-2025 GoodData Corporation

import {
    DashboardCommandFailed,
    DashboardDrillDownResolved,
    DrillDown,
    drillDown,
    useDashboardCommandProcessing,
} from "../../../model/index.js";

/**
 * @internal
 */
export interface UseDrillDownProps {
    onSuccess?: (event: DashboardDrillDownResolved) => void;
    onError?: (event: DashboardCommandFailed<DrillDown>) => void;
    onBeforeRun?: (cmd: DrillDown) => void;
}

/**
 * @internal
 */
export const useDrillDown = ({ onSuccess, onError, onBeforeRun }: UseDrillDownProps = {}) => {
    return useDashboardCommandProcessing({
        commandCreator: drillDown,
        successEvent: "GDC.DASH/EVT.DRILL.DRILL_DOWN.RESOLVED",
        errorEvent: "GDC.DASH/EVT.COMMAND.FAILED",
        onSuccess,
        onError,
        onBeforeRun,
    });
};
