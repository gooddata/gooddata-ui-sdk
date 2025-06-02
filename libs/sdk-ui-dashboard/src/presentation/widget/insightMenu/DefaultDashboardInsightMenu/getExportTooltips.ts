// (C) 2024-2025 GoodData Corporation
import { IExecutionResultEnvelope } from "../../../../model/index.js";
import { isDataError, isDataErrorTooLarge } from "../../../../_staging/errors/errorPredicates.js";
import { defineMessages } from "react-intl";
import { XLSXDisabledReason } from "./types.js";

const tooltipMessages = defineMessages({
    tooLarge: { id: "options.menu.data.too.large" },
    rawError: { id: "options.menu.unsupported.raw.error" },
    dataError: { id: "options.menu.unsupported.error" },
    loading: { id: "options.menu.unsupported.loading" },
    exporting: { id: "options.menu.export.in.progress" },
    xlsxOldWidget: { id: "options.menu.unsupported.xlsxOldWidget" },
});

export const getExportTooltipId = ({
    isRawExportsEnabled,
    isExporting,
    execution,
    xlsxDisabledReason,
}: {
    execution?: IExecutionResultEnvelope;
    isExporting: boolean;
    isRawExportsEnabled?: boolean;
    xlsxDisabledReason?: XLSXDisabledReason;
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
    if (xlsxDisabledReason === "oldWidget") {
        return tooltipMessages.xlsxOldWidget.id;
    }
    return tooltipMessages.loading.id;
};
