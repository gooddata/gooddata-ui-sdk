// (C) 2020-2026 GoodData Corporation

import { type IDrillToDashboard, drillToDashboard } from "../../../model/commands/drill.js";
import type { IDashboardDrillToDashboardResolved } from "../../../model/events/drill.js";
import type { IDashboardCommandFailed } from "../../../model/events/general.js";
import { useDashboardCommandProcessing } from "../../../model/react/useDashboardCommandProcessing.js";

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
