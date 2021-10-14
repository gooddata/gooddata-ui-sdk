// (C) 2021 GoodData Corporation
import { IntlShape } from "react-intl";

import { IInsightMenuItem } from "../types";

/**
 * @internal
 */
export function getDefaultInsightMenuItems(
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
            itemName: intl.formatMessage({ id: "widget.options.menu.exportToXLSX" }),
            onClick: onExportXLSX,
            disabled: exportXLSXDisabled,
            tooltip: tooltipMessage,
            icon: "gd-icon-download",
            className: "s-options-menu-export-xlsx",
        },
        {
            type: "button",
            itemId: "ExportCSVBubble",
            itemName: intl.formatMessage({ id: "widget.options.menu.exportToCSV" }),
            onClick: onExportCSV,
            disabled: exportCSVDisabled,
            tooltip: tooltipMessage,
            icon: "gd-icon-download",
            className: "s-options-menu-export-csv",
        },
    ];
}
