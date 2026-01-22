// (C) 2023-2026 GoodData Corporation

import { type ICrossFiltering, crossFiltering } from "../../../model/commands/drill.js";
import type { IDashboardCrossFilteringResolved } from "../../../model/events/drill.js";
import type { IDashboardCommandFailed } from "../../../model/events/general.js";
import { useDashboardCommandProcessing } from "../../../model/react/useDashboardCommandProcessing.js";

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
