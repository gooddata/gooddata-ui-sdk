// (C) 2023 GoodData Corporation

import {
    DashboardCommandFailed,
    useDashboardCommandProcessing,
    DashboardCrossFilteringResolved,
    CrossFiltering,
    crossFiltering,
} from "../../../model/index.js";

/**
 * @internal
 */
export interface UseCrossFilteringProps {
    onSuccess?: (event: DashboardCrossFilteringResolved) => void;
    onError?: (event: DashboardCommandFailed<CrossFiltering>) => void;
    onBeforeRun?: (cmd: CrossFiltering) => void;
}

/**
 * @internal
 */
export const useCrossFiltering = ({ onSuccess, onError, onBeforeRun }: UseCrossFilteringProps = {}) => {
    return useDashboardCommandProcessing({
        commandCreator: crossFiltering,
        successEvent: "GDC.DASH/EVT.DRILL.CROSS_FILTERING.RESOLVED",
        errorEvent: "GDC.DASH/EVT.COMMAND.FAILED",
        onSuccess,
        onError,
        onBeforeRun,
    });
};
