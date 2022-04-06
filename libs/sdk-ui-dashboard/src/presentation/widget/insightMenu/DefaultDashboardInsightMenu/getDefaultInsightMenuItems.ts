// (C) 2021-2022 GoodData Corporation
import { IntlShape } from "react-intl";
import compact from "lodash/compact";

import { IInsightMenuItem } from "../types";

/**
 * @internal
 */
export function getDefaultInsightMenuItems(
    intl: IntlShape,
    config: {
        exportXLSXDisabled: boolean;
        exportCSVDisabled: boolean;
        scheduleExportDisabled: boolean;
        onExportXLSX: () => void;
        onExportCSV: () => void;
        onScheduleExport: () => void;
        isScheduleExportVisible: boolean;
        tooltipMessage: string;
    },
): IInsightMenuItem[] {
    const {
        exportCSVDisabled,
        exportXLSXDisabled,
        scheduleExportDisabled,
        onExportCSV,
        onExportXLSX,
        onScheduleExport,
        isScheduleExportVisible,
        tooltipMessage,
    } = config;

    return compact([
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
        isScheduleExportVisible && {
            type: "button",
            itemId: "ScheduleExport",
            itemName: intl.formatMessage({ id: "widget.options.menu.scheduleExport" }),
            onClick: onScheduleExport,
            disabled: scheduleExportDisabled,
            tooltip: tooltipMessage,
            icon: "gd-icon-clock",
            className: "s-options-menu-schedule-export",
        },
    ]);
}
