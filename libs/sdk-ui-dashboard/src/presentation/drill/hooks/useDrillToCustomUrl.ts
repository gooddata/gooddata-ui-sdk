// (C) 2020-2026 GoodData Corporation

import { type IDrillToCustomUrl, drillToCustomUrl } from "../../../model/commands/drill.js";
import type { IDashboardDrillToCustomUrlResolved } from "../../../model/events/drill.js";
import type { IDashboardCommandFailed } from "../../../model/events/general.js";
import { useDashboardCommandProcessing } from "../../../model/react/useDashboardCommandProcessing.js";

/**
 * @internal
 */
export interface IUseDrillToCustomUrlProps {
    onSuccess?: (event: IDashboardDrillToCustomUrlResolved) => void;
    onError?: (event: IDashboardCommandFailed<IDrillToCustomUrl>) => void;
    onBeforeRun?: (cmd: IDrillToCustomUrl) => void;
}

/**
 * @internal
 */
export const useDrillToCustomUrl = ({ onSuccess, onError, onBeforeRun }: IUseDrillToCustomUrlProps = {}) => {
    return useDashboardCommandProcessing({
        commandCreator: drillToCustomUrl,
        successEvent: "GDC.DASH/EVT.DRILL.DRILL_TO_CUSTOM_URL.RESOLVED",
        errorEvent: "GDC.DASH/EVT.COMMAND.FAILED",
        onSuccess,
        onError,
        onBeforeRun,
    });
};
