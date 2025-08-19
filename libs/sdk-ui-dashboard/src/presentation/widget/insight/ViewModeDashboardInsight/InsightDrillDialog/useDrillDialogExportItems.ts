// (C) 2025 GoodData Corporation

import React from "react";

import { defineMessages, useIntl } from "react-intl";

import { idRef } from "@gooddata/sdk-model";
import { IUiMenuInteractiveItem, IUiMenuItem } from "@gooddata/sdk-ui-kit";

import {
    selectExecutionResultByRef,
    selectSettings,
    useDashboardSelector,
} from "../../../../../model/index.js";
import { getExportTooltipId } from "../../../insightMenu/DefaultDashboardInsightMenu/getExportTooltips.js";

export interface IMenuItemData {
    interactive: {
        action: () => void;
        disabledTooltip?: string;
        /**
         * @deprecated use `dataTestId` instead. Prop will be removed.
         */
        className?: string;
        dataTestId?: string;
    };
}

export type IMenuItem = IUiMenuItem<IMenuItemData>;
export type IMenuInteractiveItem = IUiMenuInteractiveItem<IMenuItemData>;

export const DRILL_MODAL_EXECUTION_PSEUDO_REF = idRef("@@GDC_DRILL_MODAL");

export const itemMessages = defineMessages({
    xlsx: { id: "widget.drill.dialog.exportToXLSX" },
    csvFormatted: { id: "widget.drill.dialog.exportToCSV.formatted" },
    csvRaw: { id: "widget.drill.dialog.exportToCSV.raw" },
});

export const useDrillDialogExportItems = ({
    isExporting,

    isDropdownDisabled,
    isExportRawVisible,

    isExportXLSXEnabled,
    isExportCSVEnabled,
    isExportCSVRawEnabled,

    onExportXLSX,
    onExportCSV,
    onExportCSVRaw,
}: {
    isExporting: boolean;

    isDropdownDisabled: boolean;
    isExportRawVisible: boolean;

    isExportXLSXEnabled: boolean;
    isExportCSVEnabled: boolean;
    isExportCSVRawEnabled: boolean;

    onExportXLSX: () => void;
    onExportCSV: () => void;
    onExportCSVRaw: () => void;
}): IMenuInteractiveItem[] => {
    const { formatMessage } = useIntl();

    const execution = useDashboardSelector(selectExecutionResultByRef(DRILL_MODAL_EXECUTION_PSEUDO_REF));
    const settings = useDashboardSelector(selectSettings);
    const disabledTooltip = formatMessage({
        id: getExportTooltipId({ execution, isExporting, isRawExportsEnabled: settings?.enableRawExports }),
    });

    return React.useMemo<IMenuInteractiveItem[]>(() => {
        const allItems = [
            {
                type: "interactive" as const,
                data: {
                    action: onExportXLSX,
                    className: "s-export-drilled-insight-xlsx",
                    dataTestId: "s-export-drilled-insight-xlsx",
                    disabledTooltip,
                },
                id: "xslx",
                stringTitle: formatMessage({ id: itemMessages.xlsx.id }),
                isDisabled: !isExportXLSXEnabled,
            },
            {
                type: "interactive" as const,
                data: {
                    action: onExportCSV,
                    className: "s-export-drilled-insight-csv-formatted",
                    dataTestId: "s-export-drilled-insight-csv-formatted",
                    disabledTooltip,
                },
                id: "csv-formatted",
                stringTitle: formatMessage({ id: itemMessages.csvFormatted.id }),
                isDisabled: !isExportCSVEnabled,
            },
            {
                type: "interactive" as const,
                data: {
                    action: onExportCSVRaw,
                    className: "s-export-drilled-insight-csv-raw",
                    dataTestId: "s-export-drilled-insight-csv-raw",
                    disabledTooltip,
                },
                id: "csv-raw",
                stringTitle: formatMessage({ id: itemMessages.csvRaw.id }),
                isDisabled: !isExportCSVRawEnabled,
            },
        ];

        if (isExportRawVisible) {
            return allItems;
        }

        if (isDropdownDisabled) {
            return [];
        }

        return allItems.filter((item) => !item.isDisabled);
    }, [
        onExportXLSX,
        disabledTooltip,
        formatMessage,
        isExportXLSXEnabled,
        onExportCSV,
        isExportCSVEnabled,
        onExportCSVRaw,
        isExportCSVRawEnabled,
        isExportRawVisible,
        isDropdownDisabled,
    ]);
};
