// (C) 2024-2026 GoodData Corporation

import { defineMessages } from "react-intl";

import { type DisabledReason } from "./types.js";
import { isDataError, isDataErrorTooLarge } from "../../../../_staging/errors/errorPredicates.js";
import { type IExecutionResultEnvelope } from "../../../../model/store/executionResults/types.js";

const tooltipMessages = defineMessages({
    tooLarge: { id: "options.menu.data.too.large" },
    rawError: { id: "options.menu.unsupported.raw.error" },
    dataError: { id: "options.menu.unsupported.error" },
    loading: { id: "options.menu.unsupported.loading" },
    exporting: { id: "options.menu.export.in.progress" },
    oldWidget: { id: "options.menu.unsupported.oldWidgetExport" },
});

export const getExportTooltipId = ({
    isRawExportsEnabled,
    isExporting,
    execution,
    disabledReason,
}: {
    execution?: IExecutionResultEnvelope;
    isExporting: boolean;
    isRawExportsEnabled?: boolean;
    disabledReason?: DisabledReason;
}): string => {
    if (isExporting) {
        return tooltipMessages.exporting.id;
    }

    if (isDataErrorTooLarge(execution?.error)) {
        return tooltipMessages.tooLarge.id;
    } else if (isDataError(execution?.error)) {
        if (isRawExportsEnabled) {
            return tooltipMessages.rawError.id;
        } else {
            return tooltipMessages.dataError.id;
        }
    }
    if (disabledReason === "oldWidget") {
        return tooltipMessages.oldWidget.id;
    }
    return tooltipMessages.loading.id;
};
