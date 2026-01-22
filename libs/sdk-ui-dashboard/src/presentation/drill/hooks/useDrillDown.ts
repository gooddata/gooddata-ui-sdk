// (C) 2020-2026 GoodData Corporation

import { type IDrillDown, drillDown } from "../../../model/commands/drill.js";
import type { IDashboardDrillDownResolved } from "../../../model/events/drill.js";
import type { IDashboardCommandFailed } from "../../../model/events/general.js";
import { useDashboardCommandProcessing } from "../../../model/react/useDashboardCommandProcessing.js";

/**
 * @internal
 */
export interface IUseDrillDownProps {
    onSuccess?: (event: IDashboardDrillDownResolved) => void;
    onError?: (event: IDashboardCommandFailed<IDrillDown>) => void;
    onBeforeRun?: (cmd: IDrillDown) => void;
}

/**
 * @internal
 */
export const useDrillDown = ({ onSuccess, onError, onBeforeRun }: IUseDrillDownProps = {}) => {
    return useDashboardCommandProcessing({
        commandCreator: drillDown,
        successEvent: "GDC.DASH/EVT.DRILL.DRILL_DOWN.RESOLVED",
        errorEvent: "GDC.DASH/EVT.COMMAND.FAILED",
        onSuccess,
        onError,
        onBeforeRun,
    });
};
