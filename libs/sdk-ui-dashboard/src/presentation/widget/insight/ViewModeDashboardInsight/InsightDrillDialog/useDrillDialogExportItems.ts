// (C) 2025 GoodData Corporation

import { useMemo } from "react";

import { defineMessages, useIntl } from "react-intl";

import { idRef } from "@gooddata/sdk-model";
import { type IUiMenuInteractiveItem, type IUiMenuItem, type IconType } from "@gooddata/sdk-ui-kit";

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
        icon: IconType;
    };
}

export type IMenuItem = IUiMenuItem<IMenuItemData>;
export type IMenuInteractiveItem = IUiMenuInteractiveItem<IMenuItemData>;

export const DRILL_MODAL_EXECUTION_PSEUDO_REF = idRef("@@GDC_DRILL_MODAL");

export const itemMessages = defineMessages({
    xlsx: { id: "widget.drill.dialog.exportToXLSX" },
    csvFormatted: { id: "widget.drill.dialog.exportToCSV.formatted" },
    csvRaw: { id: "widget.drill.dialog.exportToCSV.raw" },
    pdf: { id: "widget.drill.dialog.exportToPDF" },
});

export const useDrillDialogExportItems = ({
    isExporting,

    isDropdownDisabled,
    isExportRawVisible,

    isExportXLSXEnabled,
    isExportCSVEnabled,
    isExportCSVRawEnabled,
    isExportPDFEnabled,
    isExportPDFVisible,

    onExportXLSX,
    onExportCSV,
    onExportCSVRaw,
    onExportPDF,
}: {
    isExporting: boolean;

    isDropdownDisabled: boolean;
    isExportRawVisible: boolean;

    isExportXLSXEnabled: boolean;
    isExportCSVEnabled: boolean;
    isExportCSVRawEnabled: boolean;
    isExportPDFEnabled: boolean;
    isExportPDFVisible: boolean;

    onExportXLSX: () => void;
    onExportCSV: () => void;
    onExportCSVRaw: () => void;
    onExportPDF: () => void;
}): IMenuInteractiveItem[] => {
    const { formatMessage } = useIntl();

    const execution = useDashboardSelector(selectExecutionResultByRef(DRILL_MODAL_EXECUTION_PSEUDO_REF));
    const settings = useDashboardSelector(selectSettings);
    const disabledTooltip = formatMessage({
        id: getExportTooltipId({ execution, isExporting, isRawExportsEnabled: settings?.enableRawExports }),
    });

    return useMemo<IMenuInteractiveItem[]>(() => {
        const allItems = [
            {
                type: "interactive",
                data: {
                    action: onExportXLSX,
                    className: "s-export-drilled-insight-xlsx gd-icon-type-sheet",
                    dataTestId: "s-export-drilled-insight-xlsx",
                    disabledTooltip,
                    icon: "fileXlsx",
                },
                id: "xlsx",
                stringTitle: formatMessage({ id: itemMessages.xlsx.id }),
                isDisabled: !isExportXLSXEnabled,
            } as const,
            ...(isExportPDFVisible
                ? [
                      {
                          type: "interactive",
                          data: {
                              action: onExportPDF,
                              className: "s-export-drilled-insight-pdf gd-icon-type-pdf",
                              dataTestId: "s-export-drilled-insight-pdf",
                              disabledTooltip,
                              icon: "filePdf",
                          },
                          id: "pdf",
                          stringTitle: formatMessage({ id: itemMessages.pdf.id }),
                          isDisabled: !isExportPDFEnabled,
                      } as const,
                  ]
                : []),
            {
                type: "interactive",
                data: {
                    action: onExportCSV,
                    className: "s-export-drilled-insight-csv-formatted gd-icon-type-csv-formatted",
                    dataTestId: "s-export-drilled-insight-csv-formatted",
                    disabledTooltip,
                    icon: "fileCsvFormatted",
                },
                id: "csv-formatted",
                stringTitle: formatMessage({ id: itemMessages.csvFormatted.id }),
                isDisabled: !isExportCSVEnabled,
            } as const,
            {
                type: "interactive",
                data: {
                    action: onExportCSVRaw,
                    className: "s-export-drilled-insight-csv-raw gd-icon-type-csv-raw",
                    dataTestId: "s-export-drilled-insight-csv-raw",
                    disabledTooltip,
                    icon: "fileCsvRaw",
                },
                id: "csv-raw",
                stringTitle: formatMessage({ id: itemMessages.csvRaw.id }),
                isDisabled: !isExportCSVRawEnabled,
            } as const,
        ];

        if (isExportRawVisible) {
            return allItems;
        }

        if (isDropdownDisabled) {
            return [];
        }

        return allItems.filter((item) => !item.isDisabled);
    }, [
        formatMessage,
        onExportXLSX,
        onExportCSV,
        onExportCSVRaw,
        onExportPDF,
        isExportXLSXEnabled,
        isExportCSVEnabled,
        isExportCSVRawEnabled,
        isExportPDFEnabled,
        isExportPDFVisible,
        isExportRawVisible,
        isDropdownDisabled,
        disabledTooltip,
    ]);
};
