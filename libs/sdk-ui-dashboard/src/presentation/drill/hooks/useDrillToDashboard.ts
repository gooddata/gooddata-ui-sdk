// (C) 2020-2026 GoodData Corporation

import {
    type IDashboardCommandFailed,
    type IDashboardDrillToDashboardResolved,
    type IDrillToDashboard,
    drillToDashboard,
    useDashboardCommandProcessing,
} from "../../../model/index.js";

/**
 * @internal
 */
export interface IUseDrillToDashboardProps {
    onSuccess?: (event: IDashboardDrillToDashboardResolved) => void;
    onError?: (event: IDashboardCommandFailed<IDrillToDashboard>) => void;
    onBeforeRun?: (cmd: IDrillToDashboard) => void;
}

/**
 * @internal
 */
export const useDrillToDashboard = ({ onSuccess, onError, onBeforeRun }: IUseDrillToDashboardProps = {}) => {
    return useDashboardCommandProcessing({
        commandCreator: drillToDashboard,
        successEvent: "GDC.DASH/EVT.DRILL.DRILL_TO_DASHBOARD.RESOLVED",
        errorEvent: "GDC.DASH/EVT.COMMAND.FAILED",
        onSuccess,
        onError,
        onBeforeRun,
    });
};
