// (C) 2020-2026 GoodData Corporation

import {
    type IDashboardCommandFailed,
    type IDashboardDrillDownResolved,
    type IDrillDown,
    drillDown,
    useDashboardCommandProcessing,
} from "../../../model/index.js";

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
