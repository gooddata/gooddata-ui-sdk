// (C) 2026 GoodData Corporation

import { useMemo } from "react";

import { type IntlShape, defineMessage, defineMessages, useIntl } from "react-intl";
import { useSelector } from "react-redux";

import {
    showDialogExportCsv,
    showDialogExportPdf,
    showDialogExportReport,
} from "../../../actions/export_report_actions.js";
import {
    type AnalyticalDesignerOptionsItem,
    type IAnalyticalDesignerHeaderContext,
    type IAnalyticalDesignerOptionsProps,
} from "../../../embedding/editorHeaderSlotTypes.js";
import {
    supportsExportToCsv,
    supportsExportToXlsx,
} from "../../../selectors/backend_capabilities_selector.js";
import { isOpenInAnalyticalDesignerVisible } from "../../../selectors/editor_header_selector.js";
import {
    enableRawExports,
    isAccessibilityModeEnabled,
    isEnableTimezoneChange,
} from "../../../selectors/feature_flag_selector.js";
import {
    getExportBubbleTextProvider,
    getExportRawBubbleTextProvider,
    getExportVisible,
    getIsExportCSVDisabled,
    getIsExportCSVRawDisabled,
    getIsExportPDFDisabled,
    getIsExportXLSXDisabled,
    isTableVisualization,
} from "../../../selectors/options_menu_selector.js";
import { hasPartialDataLimitBreaks } from "../../../selectors/report_selector.js";
import { openInAnalyticalDesignerAction } from "../../../store/router/router_actions.js";
import { type AppDispatch, type IAppState } from "../../../store/types.js";
import { useGuardedCallback } from "../editorHeaderContext.js";

/**
 * Identifiers of the built-in options menu items.
 */
export const OPTIONS_ITEM_IDS = {
    openInAnalyticalDesigner: "openInAnalyticalDesigner",
    exportSection: "exportSection",
    exportXlsx: "exportXlsx",
    exportPdf: "exportPdf",
    exportCsv: "exportCsv",
    exportCsvRaw: "exportCsvRaw",
    timezoneSeparator: "timezoneSeparator",
    changeTimezone: "changeTimezone",
} as const;

const partialResultMessage = defineMessage({ id: "options.menu.export_data.partial_result_disabled" });

const csvMessages = defineMessages({
    csv: { id: "export.type.CSV" },
    csvFormatted: { id: "export.type.CSV.formatted" },
});

// Formatted exports are refused while the result is partial; raw exports are not.
const isXlsxAllowed = (state: IAppState) =>
    !getIsExportXLSXDisabled(state) && !hasPartialDataLimitBreaks(state);
const isPdfAllowed = (state: IAppState) =>
    !getIsExportPDFDisabled(state) && !hasPartialDataLimitBreaks(state);
const isCsvAllowed = (state: IAppState) =>
    !getIsExportCSVDisabled(state) && !hasPartialDataLimitBreaks(state);
const isCsvRawAllowed = (state: IAppState) => !getIsExportCSVRawDisabled(state);

const runExportXlsx = (dispatch: AppDispatch) => dispatch(showDialogExportReport());
const runExportPdf = (dispatch: AppDispatch) => dispatch(showDialogExportPdf());
const runExportCsv = (dispatch: AppDispatch) => dispatch(showDialogExportCsv("formatted"));
const runExportCsvRaw = (dispatch: AppDispatch) => dispatch(showDialogExportCsv("raw"));
const runOpenInAnalyticalDesigner = (dispatch: AppDispatch) => dispatch(openInAnalyticalDesignerAction());

const tooltip = (text: string | undefined) => (text ? { disabledTooltip: text } : {});

const noBubbleText = (_intl: IntlShape) => "";

/**
 * Props of the Options slot.
 *
 * @param onChangeTimezone - opens the time zone dialog, which the editor actions own so that it opens for a
 *  host's own Options menu too
 */
export function useOptionsProps(
    context: IAnalyticalDesignerHeaderContext,
    onChangeTimezone: () => void,
): IAnalyticalDesignerOptionsProps {
    const intl = useIntl();

    const exportBubbleTextProvider = useSelector(getExportBubbleTextProvider) ?? noBubbleText;
    const exportRawBubbleTextProvider = useSelector(getExportRawBubbleTextProvider) ?? noBubbleText;
    const isExportVisible = useSelector(getExportVisible);
    const isExportCSVDisabled = useSelector(getIsExportCSVDisabled);
    const isExportRawCSVDisabled = useSelector(getIsExportCSVRawDisabled);
    const isExportXLSXDisabled = useSelector(getIsExportXLSXDisabled);
    const isExportPDFDisabled = useSelector(getIsExportPDFDisabled);
    const exportToCsvSupported = useSelector(supportsExportToCsv);
    const exportToXlsxSupported = useSelector(supportsExportToXlsx);
    const exportToPdfSupported = useSelector(isTableVisualization);
    const isRawExportEnabled = useSelector(enableRawExports);
    const isPartialResult = useSelector(hasPartialDataLimitBreaks);
    const isAccessibilityMode = useSelector(isAccessibilityModeEnabled);
    const isTimezoneChangeEnabled = useSelector(isEnableTimezoneChange);
    const isOpenInAnalyticalDesignerShown = useSelector(isOpenInAnalyticalDesignerVisible);

    const onExportXlsx = useGuardedCallback(isXlsxAllowed, runExportXlsx);
    const onExportPdf = useGuardedCallback(isPdfAllowed, runExportPdf);
    const onExportCsv = useGuardedCallback(isCsvAllowed, runExportCsv);
    const onExportCsvRaw = useGuardedCallback(isCsvRawAllowed, runExportCsvRaw);
    const onOpenInAnalyticalDesigner = useGuardedCallback(
        isOpenInAnalyticalDesignerVisible,
        runOpenInAnalyticalDesigner,
    );

    const items = useMemo((): AnalyticalDesignerOptionsItem[] => {
        const formattedTooltip = isPartialResult
            ? intl.formatMessage(partialResultMessage)
            : exportBubbleTextProvider(intl);
        const result: AnalyticalDesignerOptionsItem[] = [];

        if (isOpenInAnalyticalDesignerShown) {
            result.push({
                type: "action",
                id: OPTIONS_ITEM_IDS.openInAnalyticalDesigner,
                label: intl.formatMessage({ id: "options.menu.open.in.analytical.designer" }),
                isDisabled: false,
                onSelect: onOpenInAnalyticalDesigner,
            });
        }

        if (isExportVisible) {
            result.push({
                type: "section",
                id: OPTIONS_ITEM_IDS.exportSection,
                label: intl.formatMessage({ id: "options.menu.export_data" }),
            });
            if (exportToXlsxSupported) {
                result.push({
                    type: "action",
                    id: OPTIONS_ITEM_IDS.exportXlsx,
                    label: intl.formatMessage({ id: "export.type.XLSX" }),
                    isDisabled: isExportXLSXDisabled || isPartialResult,
                    ...tooltip(formattedTooltip),
                    onSelect: onExportXlsx,
                });
            }
            if (exportToPdfSupported && !isAccessibilityMode) {
                result.push({
                    type: "action",
                    id: OPTIONS_ITEM_IDS.exportPdf,
                    label: intl.formatMessage({ id: "export.type.PDF" }),
                    isDisabled: isExportPDFDisabled || isPartialResult,
                    ...tooltip(formattedTooltip),
                    onSelect: onExportPdf,
                });
            }
            if (exportToCsvSupported) {
                result.push({
                    type: "action",
                    id: OPTIONS_ITEM_IDS.exportCsv,
                    label: intl.formatMessage(
                        isRawExportEnabled ? csvMessages.csvFormatted : csvMessages.csv,
                    ),
                    isDisabled: isExportCSVDisabled || isPartialResult,
                    ...tooltip(formattedTooltip),
                    onSelect: onExportCsv,
                });
                if (isRawExportEnabled) {
                    result.push({
                        type: "action",
                        id: OPTIONS_ITEM_IDS.exportCsvRaw,
                        label: intl.formatMessage({ id: "export.type.CSV.raw" }),
                        isDisabled: isExportRawCSVDisabled,
                        ...tooltip(exportRawBubbleTextProvider(intl)),
                        onSelect: onExportCsvRaw,
                    });
                }
            }
        }

        if (isTimezoneChangeEnabled) {
            result.push(
                { type: "separator", id: OPTIONS_ITEM_IDS.timezoneSeparator },
                {
                    type: "action",
                    id: OPTIONS_ITEM_IDS.changeTimezone,
                    label: intl.formatMessage({ id: "options.menu.changeTimezone" }),
                    isDisabled: false,
                    onSelect: onChangeTimezone,
                },
            );
        }

        return normalizeOptionsItems(result);
    }, [
        intl,
        exportBubbleTextProvider,
        exportRawBubbleTextProvider,
        isExportVisible,
        isExportCSVDisabled,
        isExportRawCSVDisabled,
        isExportXLSXDisabled,
        isExportPDFDisabled,
        exportToCsvSupported,
        exportToXlsxSupported,
        exportToPdfSupported,
        isRawExportEnabled,
        isPartialResult,
        isAccessibilityMode,
        isTimezoneChangeEnabled,
        isOpenInAnalyticalDesignerShown,
        onExportXlsx,
        onExportPdf,
        onExportCsv,
        onExportCsvRaw,
        onOpenInAnalyticalDesigner,
        onChangeTimezone,
    ]);

    const label = "⋯";
    const accessibleName = intl.formatMessage({ id: "options.menu.ariaLabel" });

    return useMemo(
        () => ({ ...context, label, accessibleName, isDisabled: false, items }),
        [context, accessibleName, items],
    );
}

/**
 * Drops the sections with no action after them and the separators that separate nothing.
 */
export function normalizeOptionsItems(
    items: readonly AnalyticalDesignerOptionsItem[],
): AnalyticalDesignerOptionsItem[] {
    // a section labels the actions up to the next section or separator
    const withoutEmptySections = items.filter(
        (item, index) => item.type !== "section" || items[index + 1]?.type === "action",
    );

    const result: AnalyticalDesignerOptionsItem[] = [];
    for (const item of withoutEmptySections) {
        const previous = result[result.length - 1];
        if (item.type === "separator" && (!previous || previous.type === "separator")) {
            continue;
        }
        result.push(item);
    }
    while (result[result.length - 1]?.type === "separator") {
        result.pop();
    }
    return result;
}
