// (C) 2020-2026 GoodData Corporation

import {
    type IDashboardCommandFailed,
    type IDashboardDrillToAttributeUrlResolved,
    type IDrillToAttributeUrl,
    drillToAttributeUrl,
    useDashboardCommandProcessing,
} from "../../../model/index.js";

/**
 * @internal
 */
export interface IUseDrillToAttributeUrlProps {
    onSuccess?: (event: IDashboardDrillToAttributeUrlResolved) => void;
    onError?: (event: IDashboardCommandFailed<IDrillToAttributeUrl>) => void;
    onBeforeRun?: (cmd: IDrillToAttributeUrl) => void;
}

/**
 * @internal
 */
export const useDrillToAttributeUrl = ({
    onSuccess,
    onError,
    onBeforeRun,
}: IUseDrillToAttributeUrlProps = {}) => {
    return useDashboardCommandProcessing({
        commandCreator: drillToAttributeUrl,
        successEvent: "GDC.DASH/EVT.DRILL.DRILL_TO_ATTRIBUTE_URL.RESOLVED",
        errorEvent: "GDC.DASH/EVT.COMMAND.FAILED",
        onSuccess,
        onError,
        onBeforeRun,
    });
};
