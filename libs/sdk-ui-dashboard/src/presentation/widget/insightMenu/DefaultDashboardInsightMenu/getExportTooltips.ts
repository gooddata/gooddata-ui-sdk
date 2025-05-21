// (C) 2024-2025 GoodData Corporation
import { IExecutionResultEnvelope } from "../../../../model/index.js";
import { isDataError, isDataErrorTooLarge } from "../../../../_staging/errors/errorPredicates.js";
import { defineMessages } from "react-intl";

const tooltipMessages = defineMessages({
    tooLarge: { id: "options.menu.data.too.large" },
    rawError: { id: "options.menu.unsupported.raw.error" },
    dataError: { id: "options.menu.unsupported.error" },
    loading: { id: "options.menu.unsupported.loading" },
    exporting: { id: "options.menu.export.in.progress" },
});

export const getExportTooltip = ({
    isRawExportsEnabled,
    isExporting,
    execution,
}: {
    execution?: IExecutionResultEnvelope;
    isExporting: boolean;
    isRawExportsEnabled?: boolean;
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
    return tooltipMessages.loading.id;
};
