// (C) 2007-2026 GoodData Corporation

import { memo, useCallback, useState } from "react";

import { type IntlShape, defineMessage, useIntl } from "react-intl";
import { connect } from "react-redux";
import { createStructuredSelector } from "reselect";

import { Header, ItemsWrapper, Overlay, Separator } from "@gooddata/sdk-ui-kit";

import {
    type ExportCsvMode,
    showDialogExportCsv,
    showDialogExportPdf,
    showDialogExportReport,
} from "../../../actions/export_report_actions.js";
import { exportReport } from "../../../actions/report_actions.js";
import {
    supportsExportToCsv,
    supportsExportToXlsx,
} from "../../../selectors/backend_capabilities_selector.js";
import { AVAILABLE_HIDDEN_ACTIONS, hiddenActions } from "../../../selectors/editor_header_selector.js";
import { getBubbleTextProvider, getIsExportDisabled } from "../../../selectors/export_button_selector.js";
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
import { isEditFromKD } from "../../../selectors/route_selector.js";
import { openInAnalyticalDesignerAction } from "../../../store/router/router_actions.js";
import { type IAppState } from "../../../store/types.js";
import { TimezoneDialog } from "../TimezoneDialog.js";

import { OptionsMenuItem } from "./OptionsMenuItem.js";

const noopString = () => "";

const partialResultExportBubbleTextProvider = (intl: IntlShape): string =>
    intl.formatMessage(defineMessage({ id: "options.menu.export_data.partial_result_disabled" }));

interface IOptionsMenuDispatchProps {
    onOpenAsReport: (title: string) => void;
    showDialogExportCsv: (mode: ExportCsvMode) => void;
    showDialogExportReport: () => void;
    showDialogExportPdf: () => void;
    openInAnalyticalDesigner: () => ReturnType<typeof openInAnalyticalDesignerAction>;
}

type BubbleTextProvider = (intl: IntlShape) => string;

interface IOptionsMenuStateProps {
    bubbleTextProvider?: BubbleTextProvider;
    exportBubbleTextProvider?: BubbleTextProvider;
    exportRawBubbleTextProvider?: BubbleTextProvider;
    isOpenAsReportDisabled: boolean;
    isExportVisible: boolean;
    isExportCSVDisabled: boolean;
    isExportRawCSVDisabled: boolean;
    isExportXLSXDisabled: boolean;
    isExportPDFDisabled: boolean;
    exportToCsvSupported: boolean;
    exportToXlsxSupported: boolean;
    exportToPdfSupported: boolean;
    isEditFromKD: boolean;
    hiddenActions: string[];
    enableRawExports: boolean;
    hasPartialDataLimitBreaks: boolean;
    isAccessibilityModeEnabled: boolean;
    isEnableTimezoneChange: boolean;
}

interface IOptionsMenuOwnProps {
    isShowOptionsMenu: boolean;
    toggleOptionsMenu: () => void;
}

type IOptionsMenuProps = IOptionsMenuDispatchProps & IOptionsMenuStateProps & IOptionsMenuOwnProps;

const mapStateToProps = createStructuredSelector({
    bubbleTextProvider: getBubbleTextProvider,
    exportBubbleTextProvider: getExportBubbleTextProvider,
    exportRawBubbleTextProvider: getExportRawBubbleTextProvider,
    isOpenAsReportDisabled: getIsExportDisabled,
    isExportCSVDisabled: getIsExportCSVDisabled,
    isExportRawCSVDisabled: getIsExportCSVRawDisabled,
    isExportXLSXDisabled: getIsExportXLSXDisabled,
    isExportPDFDisabled: getIsExportPDFDisabled,
    isExportVisible: getExportVisible,
    isEditFromKD,
    hiddenActions,
    exportToCsvSupported: supportsExportToCsv,
    exportToXlsxSupported: supportsExportToXlsx,
    exportToPdfSupported: isTableVisualization,
    enableRawExports: enableRawExports,
    hasPartialDataLimitBreaks,
    isAccessibilityModeEnabled: isAccessibilityModeEnabled,
    isEnableTimezoneChange,
});

const mapDispatchToProps: IOptionsMenuDispatchProps = {
    showDialogExportCsv,
    onOpenAsReport: exportReport,
    showDialogExportReport,
    showDialogExportPdf,
    openInAnalyticalDesigner: openInAnalyticalDesignerAction,
};

export const OptionsMenuBase = memo(function OptionsMenuBase({
    exportBubbleTextProvider = noopString,
    exportRawBubbleTextProvider,
    isExportVisible,
    isExportCSVDisabled,
    isExportRawCSVDisabled,
    isExportXLSXDisabled,
    isExportPDFDisabled,
    exportToCsvSupported,
    exportToXlsxSupported,
    exportToPdfSupported,
    isEditFromKD,
    hiddenActions,
    enableRawExports,
    hasPartialDataLimitBreaks,
    isAccessibilityModeEnabled,
    isEnableTimezoneChange,
    isShowOptionsMenu,
    toggleOptionsMenu,
    showDialogExportCsv,
    showDialogExportReport,
    showDialogExportPdf,
    openInAnalyticalDesigner,
}: IOptionsMenuProps) {
    const intl = useIntl();

    const [isTimezoneDialogOpen, setIsTimezoneDialogOpen] = useState(false);

    const openTimezoneDialog = useCallback(() => {
        toggleOptionsMenu();
        setIsTimezoneDialogOpen(true);
    }, [toggleOptionsMenu]);

    const closeTimezoneDialog = useCallback(() => {
        setIsTimezoneDialogOpen(false);
    }, []);

    const openExportCsvDialog = useCallback(
        (mode: ExportCsvMode) => {
            showDialogExportCsv(mode);
            toggleOptionsMenu();
        },
        [showDialogExportCsv, toggleOptionsMenu],
    );

    const exportToCSV = useCallback(() => {
        openExportCsvDialog("formatted");
    }, [openExportCsvDialog]);

    const exportToPDF = useCallback(() => {
        toggleOptionsMenu();
        showDialogExportPdf();
    }, [toggleOptionsMenu, showDialogExportPdf]);

    const showExportDialog = useCallback(() => {
        toggleOptionsMenu();
        showDialogExportReport();
    }, [showDialogExportReport, toggleOptionsMenu]);

    const exportToCSVRaw = useCallback(() => {
        openExportCsvDialog("raw");
    }, [openExportCsvDialog]);

    const onOpenInAnalyticalDesigner = useCallback(() => {
        openInAnalyticalDesigner();
        toggleOptionsMenu();
    }, [openInAnalyticalDesigner, toggleOptionsMenu]);

    const renderExportMenu = useCallback(() => {
        const isOpenInADVisible =
            isEditFromKD && !hiddenActions.includes(AVAILABLE_HIDDEN_ACTIONS.OPEN_IN_ANALYTICAL_DESIGNER);
        const formattedExportBubbleTextProvider = hasPartialDataLimitBreaks
            ? partialResultExportBubbleTextProvider
            : exportBubbleTextProvider;
        const isFormattedExportDisabled = (isDisabled: boolean) => isDisabled || hasPartialDataLimitBreaks;

        return (
            <Overlay
                key="OptionsMenu"
                alignTo=".s-options-button"
                alignPoints={[{ align: "br tr" }]}
                className="gd-export-menu-overlay s-gd-export-menu-overlay"
                closeOnMouseDrag
                closeOnOutsideClick
                onClose={toggleOptionsMenu}
            >
                <ItemsWrapper smallItemsSpacing>
                    {isOpenInADVisible ? (
                        <OptionsMenuItem
                            bubbleId="options.menu.open.in.analytical.designer"
                            className="gd-open-in-analytical-designer s-open-in-analytical-designer"
                            titleId={defineMessage({ id: "options.menu.open.in.analytical.designer" }).id}
                            isDisabled={false}
                            onClick={onOpenInAnalyticalDesigner}
                        />
                    ) : null}
                    {isExportVisible ? (
                        <>
                            <Header>{intl.formatMessage({ id: "options.menu.export_data" })}</Header>
                            {exportToXlsxSupported ? (
                                <OptionsMenuItem
                                    bubbleId="ExportXLSXBubble"
                                    bubbleTextProvider={formattedExportBubbleTextProvider}
                                    className="gd-export-menu-export-xlsx s-gd-export-menu-export-xlsx gd-export-options-xlsx"
                                    isDisabled={isFormattedExportDisabled(isExportXLSXDisabled)}
                                    titleId={defineMessage({ id: "export.type.XLSX" }).id}
                                    onClick={showExportDialog}
                                />
                            ) : null}
                            {exportToPdfSupported && !isAccessibilityModeEnabled ? (
                                <OptionsMenuItem
                                    bubbleId="ExportPDFBubble"
                                    bubbleTextProvider={formattedExportBubbleTextProvider}
                                    className="gd-export-menu-export-pdf s-gd-export-menu-export-pdf gd-export-options-pdf"
                                    isDisabled={isFormattedExportDisabled(isExportPDFDisabled)}
                                    titleId={defineMessage({ id: "export.type.PDF" }).id}
                                    onClick={exportToPDF}
                                />
                            ) : null}
                            {exportToCsvSupported ? (
                                enableRawExports ? (
                                    <>
                                        <OptionsMenuItem
                                            bubbleId="ExportCSVFormattedBubble"
                                            bubbleTextProvider={formattedExportBubbleTextProvider}
                                            className="gd-export-menu-export-csv s-gd-export-menu-export-csv gd-export-options-csv-formatted"
                                            isDisabled={isFormattedExportDisabled(isExportCSVDisabled)}
                                            titleId={defineMessage({ id: "export.type.CSV.formatted" }).id}
                                            onClick={exportToCSV}
                                        />
                                        <OptionsMenuItem
                                            bubbleId="ExportCSVRawBubble"
                                            bubbleTextProvider={exportRawBubbleTextProvider}
                                            className="gd-export-menu-export-csv s-gd-export-menu-export-csv gd-export-options-csv-raw"
                                            isDisabled={isExportRawCSVDisabled}
                                            titleId={defineMessage({ id: "export.type.CSV.raw" }).id}
                                            onClick={exportToCSVRaw}
                                        />
                                    </>
                                ) : (
                                    <OptionsMenuItem
                                        bubbleId="ExportCSVBubble"
                                        bubbleTextProvider={formattedExportBubbleTextProvider}
                                        className="gd-export-menu-export-csv s-gd-export-menu-export-csv gd-export-options-csv-formatted"
                                        isDisabled={isFormattedExportDisabled(isExportCSVDisabled)}
                                        titleId={defineMessage({ id: "export.type.CSV" }).id}
                                        onClick={exportToCSV}
                                    />
                                )
                            ) : null}
                        </>
                    ) : null}
                    {isEnableTimezoneChange ? (
                        <>
                            {isOpenInADVisible || isExportVisible ? <Separator /> : null}
                            <OptionsMenuItem
                                bubbleId="options.menu.changeTimezone"
                                className="gd-options-menu-timezone s-options-menu-timezone"
                                titleId={defineMessage({ id: "options.menu.changeTimezone" }).id}
                                isDisabled={false}
                                onClick={openTimezoneDialog}
                            />
                        </>
                    ) : null}
                </ItemsWrapper>
            </Overlay>
        );
    }, [
        exportBubbleTextProvider,
        exportRawBubbleTextProvider,
        intl,
        isExportCSVDisabled,
        isExportRawCSVDisabled,
        isExportXLSXDisabled,
        isExportPDFDisabled,
        toggleOptionsMenu,
        isExportVisible,
        isEditFromKD,
        hiddenActions,
        exportToCsvSupported,
        exportToXlsxSupported,
        exportToPdfSupported,
        enableRawExports,
        hasPartialDataLimitBreaks,
        onOpenInAnalyticalDesigner,
        showExportDialog,
        exportToCSV,
        exportToCSVRaw,
        exportToPDF,
        isAccessibilityModeEnabled,
        isEnableTimezoneChange,
        openTimezoneDialog,
    ]);

    return (
        <>
            {isShowOptionsMenu ? renderExportMenu() : null}
            {isTimezoneDialogOpen ? <TimezoneDialog onClose={closeTimezoneDialog} /> : null}
        </>
    );
});

export const OptionsMenu = connect<
    IOptionsMenuStateProps,
    IOptionsMenuDispatchProps,
    IOptionsMenuOwnProps,
    IAppState
>(
    mapStateToProps,
    mapDispatchToProps,
)(OptionsMenuBase);
