// (C) 2020-2026 GoodData Corporation

import {
    type IDashboardCommandFailed,
    type IDashboardDrillToCustomUrlResolved,
    type IDrillToCustomUrl,
    drillToCustomUrl,
    useDashboardCommandProcessing,
} from "../../../model/index.js";

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
