// (C) 2020-2026 GoodData Corporation

import { type IDrillToInsight, drillToInsight } from "../../../model/commands/drill.js";
import type { IDashboardDrillToInsightResolved } from "../../../model/events/drill.js";
import type { IDashboardCommandFailed } from "../../../model/events/general.js";
import { useDashboardCommandProcessing } from "../../../model/react/useDashboardCommandProcessing.js";

/**
 * @internal
 */
export interface IUseDrillToInsightProps {
    onSuccess?: (event: IDashboardDrillToInsightResolved) => void;
    onError?: (event: IDashboardCommandFailed<IDrillToInsight>) => void;
    onBeforeRun?: (cmd: IDrillToInsight) => void;
}

/**
 * @internal
 */
export const useDrillToInsight = ({ onSuccess, onError, onBeforeRun }: IUseDrillToInsightProps = {}) => {
    return useDashboardCommandProcessing({
        commandCreator: drillToInsight,
        successEvent: "GDC.DASH/EVT.DRILL.DRILL_TO_INSIGHT.RESOLVED",
        errorEvent: "GDC.DASH/EVT.COMMAND.FAILED",
        onSuccess,
        onError,
        onBeforeRun,
    });
};
