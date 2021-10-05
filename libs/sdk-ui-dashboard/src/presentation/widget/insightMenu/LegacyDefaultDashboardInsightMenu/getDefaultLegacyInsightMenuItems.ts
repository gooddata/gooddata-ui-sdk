// (C) 2021 GoodData Corporation
import { IntlShape } from "react-intl";

import { IInsightMenuItem } from "../types";

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
        tooltipMessage: string;
    },
): IInsightMenuItem[] {
    const { exportCSVDisabled, exportXLSXDisabled, onExportCSV, onExportXLSX, tooltipMessage } = config;

    return [
        {
            type: "button",
            itemId: "ExportXLSXBubble",
            itemName: intl.formatMessage({ id: "options.menu.export.XLSX" }),
            disabled: exportXLSXDisabled,
            onClick: onExportXLSX,
            tooltip: tooltipMessage,
            className: "options-menu-export-xlsx s-options-menu-export-xlsx",
        },
        {
            type: "button",
            itemId: "ExportCSVBubble",
            itemName: intl.formatMessage({ id: "options.menu.export.CSV" }),
            disabled: exportCSVDisabled,
            onClick: onExportCSV,
            tooltip: tooltipMessage,
            className: "options-menu-export-csv s-options-menu-export-csv",
        },
    ];
}
