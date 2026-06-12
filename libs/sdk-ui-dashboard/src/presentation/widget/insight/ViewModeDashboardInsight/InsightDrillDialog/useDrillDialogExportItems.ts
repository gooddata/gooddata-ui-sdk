// (C) 2025-2026 GoodData Corporation

import { useMemo } from "react";

import { defineMessages, useIntl } from "react-intl";

import { type IUiMenuInteractiveItem, type IUiMenuItem, type IconType } from "@gooddata/sdk-ui-kit";

import { useDashboardSelector } from "../../../../../model/react/DashboardStoreProvider.js";
import { selectSettings } from "../../../../../model/store/config/configSelectors.js";
import { DRILL_MODAL_EXECUTION_PSEUDO_REF } from "../../../../../model/store/executionResults/constants.js";
import { selectExecutionResultByRef } from "../../../../../model/store/executionResults/executionResultsSelectors.js";
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

    // When the drilled execution reached a result limit, formatted exports (XLSX, formatted CSV, PDF) can
    // only contain partial data and are disabled with an explanatory tooltip. Raw CSV is unaffected (it runs
    // a separate full execution). An in-progress export takes priority over the limit message (disabledTooltip
    // already resolves to the in-progress reason while exporting).
    const hasLimitBreaks = (execution?.limitBreaks?.length ?? 0) > 0;
    const formattedExportTooltip =
        !isExporting && hasLimitBreaks
            ? formatMessage({ id: "options.menu.export.partialResults.exportDisabled" })
            : disabledTooltip;

    return useMemo<IMenuInteractiveItem[]>(() => {
        const allItems = [
            {
                type: "interactive",
                data: {
                    action: onExportXLSX,
                    className: "s-export-drilled-insight-xlsx gd-icon-type-sheet",
                    dataTestId: "s-export-drilled-insight-xlsx",
                    disabledTooltip: formattedExportTooltip,
                    icon: "fileXlsx",
                },
                id: "xlsx",
                stringTitle: formatMessage({ id: itemMessages.xlsx.id }),
                isDisabled: !isExportXLSXEnabled || hasLimitBreaks,
            } as const,
            ...(isExportPDFVisible
                ? [
                      {
                          type: "interactive",
                          data: {
                              action: onExportPDF,
                              className: "s-export-drilled-insight-pdf gd-icon-type-pdf",
                              dataTestId: "s-export-drilled-insight-pdf",
                              disabledTooltip: formattedExportTooltip,
                              icon: "filePdf",
                          },
                          id: "pdf",
                          stringTitle: formatMessage({ id: itemMessages.pdf.id }),
                          isDisabled: !isExportPDFEnabled || hasLimitBreaks,
                      } as const,
                  ]
                : []),
            {
                type: "interactive",
                data: {
                    action: onExportCSV,
                    className: "s-export-drilled-insight-csv-formatted gd-icon-type-csv-formatted",
                    dataTestId: "s-export-drilled-insight-csv-formatted",
                    disabledTooltip: formattedExportTooltip,
                    icon: "fileCsvFormatted",
                },
                id: "csv-formatted",
                stringTitle: formatMessage({ id: itemMessages.csvFormatted.id }),
                isDisabled: !isExportCSVEnabled || hasLimitBreaks,
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

        // When the execution reached a result limit, keep the (disabled) formatted export items in the menu
        // so the user sees they are unavailable because of the limit, instead of hiding them.
        if (hasLimitBreaks) {
            return allItems;
        }

        // Otherwise, when raw exports are not shown, disabled items are hidden as usual.
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
        formattedExportTooltip,
        hasLimitBreaks,
    ]);
};
