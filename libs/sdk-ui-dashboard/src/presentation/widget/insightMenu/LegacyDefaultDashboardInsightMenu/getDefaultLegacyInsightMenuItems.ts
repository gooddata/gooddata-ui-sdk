// (C) 2021-2022 GoodData Corporation
import { IntlShape } from "react-intl";

import { IInsightMenuItem } from "../types.js";

/**
 * @internal
 */
export function getDefaultLegacyInsightMenuItems(
    intl: IntlShape,
    config: {
        exportXLSXDisabled: boolean;
        exportCSVDisabled: boolean;
        onExportXLSX: () => void;
        onExportCSV: () => void;
        isDataError: boolean;
    },
): IInsightMenuItem[] {
    const { exportCSVDisabled, exportXLSXDisabled, onExportCSV, onExportXLSX, isDataError } = config;

    const tooltip = isDataError
        ? intl.formatMessage({ id: "options.menu.unsupported.error" })
        : intl.formatMessage({ id: "options.menu.unsupported.loading" });

    return [
        {
            type: "button",
            itemId: "ExportXLSXBubble",
            itemName: intl.formatMessage({ id: "options.menu.export.XLSX" }),
            disabled: exportXLSXDisabled,
            onClick: onExportXLSX,
            tooltip,
            className: "options-menu-export-xlsx s-options-menu-export-xlsx",
        },
        {
            type: "button",
            itemId: "ExportCSVBubble",
            itemName: intl.formatMessage({ id: "options.menu.export.CSV" }),
            disabled: exportCSVDisabled,
            onClick: onExportCSV,
            tooltip,
            className: "options-menu-export-csv s-options-menu-export-csv",
        },
    ];
}
