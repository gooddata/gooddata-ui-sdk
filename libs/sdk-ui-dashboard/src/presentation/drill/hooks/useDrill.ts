// (C) 2020-2026 GoodData Corporation

import { type IDrill, drill } from "../../../model/commands/drill.js";
import type { IDashboardDrillResolved } from "../../../model/events/drill.js";
import type { IDashboardCommandFailed } from "../../../model/events/general.js";
import { useDashboardCommandProcessing } from "../../../model/react/useDashboardCommandProcessing.js";

/**
 * @internal
 */
export interface IUseDrillProps {
    onSuccess?: (event: IDashboardDrillResolved) => void;
    onError?: (event: IDashboardCommandFailed<IDrill>) => void;
    onBeforeRun?: (cmd: IDrill) => void;
}

/**
 * @internal
 */
export const useDrill = ({ onSuccess, onError, onBeforeRun }: IUseDrillProps = {}) => {
    return useDashboardCommandProcessing({
        commandCreator: drill,
        successEvent: "GDC.DASH/EVT.DRILL.RESOLVED",
        errorEvent: "GDC.DASH/EVT.COMMAND.FAILED",
        onSuccess,
        onError,
        onBeforeRun,
    });
};
