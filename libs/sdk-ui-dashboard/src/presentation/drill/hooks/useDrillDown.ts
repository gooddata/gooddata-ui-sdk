// (C) 2020-2021 GoodData Corporation

import {
    DrillDown,
    DashboardDrillDownResolved,
    DashboardCommandFailed,
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
