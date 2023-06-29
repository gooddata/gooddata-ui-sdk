// (C) 2020-2021 GoodData Corporation

import {
    Drill,
    DashboardDrillResolved,
    DashboardCommandFailed,
    drill,
    useDashboardCommandProcessing,
} from "../../../model/index.js";

/**
 * @internal
 */
export interface UseDrillProps {
    onSuccess?: (event: DashboardDrillResolved) => void;
    onError?: (event: DashboardCommandFailed<Drill>) => void;
    onBeforeRun?: (cmd: Drill) => void;
}

/**
 * @internal
 */
export const useDrill = ({ onSuccess, onError, onBeforeRun }: UseDrillProps = {}) => {
    return useDashboardCommandProcessing({
        commandCreator: drill,
        successEvent: "GDC.DASH/EVT.DRILL.RESOLVED",
        errorEvent: "GDC.DASH/EVT.COMMAND.FAILED",
        onSuccess,
        onError,
        onBeforeRun,
    });
};
