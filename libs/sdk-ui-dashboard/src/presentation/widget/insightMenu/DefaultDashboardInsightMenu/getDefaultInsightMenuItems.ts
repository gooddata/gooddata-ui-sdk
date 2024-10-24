// (C) 2021-2024 GoodData Corporation
import { IntlShape } from "react-intl";
import compact from "lodash/compact.js";

import { IInsightMenuItem } from "../types.js";
import { ExportOptions } from "../../insight/configuration/ExportOptions.js";

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
        isDataError: boolean;
        isExportRawInNewUiVisible: boolean;
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
        isExportRawInNewUiVisible,
        isDataError,
    } = config;

    const tooltip = isDataError
        ? intl.formatMessage({ id: "options.menu.unsupported.error" })
        : intl.formatMessage({ id: "options.menu.unsupported.loading" });

    const menuItems: (false | IInsightMenuItem)[] = [
        isExportRawInNewUiVisible && {
            type: "submenu",
            itemId: "Exports",
            itemName: intl.formatMessage({ id: "widget.options.menu.export" }),
            icon: "gd-icon-download",
            className: "s-options-menu-exports",
            SubmenuComponent: ExportOptions,
        },
        !isExportRawInNewUiVisible && {
            type: "button",
            itemId: "ExportXLSXBubble",
            itemName: intl.formatMessage({ id: "widget.options.menu.exportToXLSX" }),
            onClick: onExportXLSX,
            disabled: exportXLSXDisabled,
            tooltip,
            icon: "gd-icon-download",
            className: "s-options-menu-export-xlsx",
        },
        !isExportRawInNewUiVisible && {
            type: "button",
            itemId: "ExportCSVBubble",
            itemName: intl.formatMessage({ id: "widget.options.menu.exportToCSV" }),
            onClick: onExportCSV,
            disabled: exportCSVDisabled,
            tooltip,
            icon: "gd-icon-download",
            className: "s-options-menu-export-csv",
        },
        isScheduleExportVisible && {
            type: "button",
            itemId: "ScheduleExport",
            itemName: intl.formatMessage({ id: "widget.options.menu.scheduleExport" }),
            onClick: onScheduleExport,
            disabled: scheduleExportDisabled,
            tooltip,
            icon: "gd-icon-clock",
            className: "s-options-menu-schedule-export",
        },
    ];

    return compact(menuItems);
}
