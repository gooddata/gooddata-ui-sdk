// (C) 2023-2026 GoodData Corporation

import {
    type ICrossFiltering,
    type IDashboardCommandFailed,
    type IDashboardCrossFilteringResolved,
    crossFiltering,
    useDashboardCommandProcessing,
} from "../../../model/index.js";

/**
 * @internal
 */
export interface IUseCrossFilteringProps {
    onSuccess?: (event: IDashboardCrossFilteringResolved) => void;
    onError?: (event: IDashboardCommandFailed<ICrossFiltering>) => void;
    onBeforeRun?: (cmd: ICrossFiltering) => void;
}

/**
 * @internal
 */
export const useCrossFiltering = ({ onSuccess, onError, onBeforeRun }: IUseCrossFilteringProps = {}) => {
    return useDashboardCommandProcessing({
        commandCreator: crossFiltering,
        successEvent: "GDC.DASH/EVT.DRILL.CROSS_FILTERING.RESOLVED",
        errorEvent: "GDC.DASH/EVT.COMMAND.FAILED",
        onSuccess,
        onError,
        onBeforeRun,
    });
};
