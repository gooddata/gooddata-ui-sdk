// (C) 2019-2025 GoodData Corporation

import { type ReactNode, useCallback, useState } from "react";

import cx from "classnames";
import { FormattedMessage, defineMessages, useIntl } from "react-intl";

import {
    Bubble,
    BubbleHoverTrigger,
    Button,
    DialogBase,
    type IAlignPoint,
    type IDialogBaseProps,
    ShortenedText,
    UiAutofocus,
    UiButton,
    useId,
} from "@gooddata/sdk-ui-kit";

import { DrillDialogExportDropdown } from "./DrillDialogExportDropdown.js";
import { getTitleWithBreadcrumbs } from "./getTitleWithBreadcrumbs.js";
import {
    selectCanExportTabular,
    selectEnableExportToPdfTabular,
    selectSettings,
    useDashboardSelector,
} from "../../../../../model/index.js";

export interface DrillDialogProps
    extends Pick<
        IDialogBaseProps,
        "initialFocus" | "returnFocusTo" | "focusCheckFn" | "accessibilityConfig" | "autofocusOnOpen"
    > {
    insightTitle: string;
    breadcrumbs: string[];
    onCloseDialog: () => void;
    onBackButtonClick: () => void;
    isBackButtonVisible?: boolean;
    children: ReactNode;

    exportAvailable: boolean;
    onExportXLSX: () => void;
    onExportCSV: () => void;
    onExportCSVRaw: () => void;
    onExportPDF: () => void;
    exportXLSXEnabled: boolean;
    exportCSVEnabled: boolean;
    exportCSVRawEnabled: boolean;
    exportPDFEnabled: boolean;
    exportPDFVisible: boolean;
    isLoading: boolean;
    isExporting: boolean;
    enableDrillDescription: boolean;
    isExportRawVisible: boolean;
    isShowAsTableVisible: boolean;
    isWidgetAsTable: boolean;
    onShowAsTable: () => void;
}

const tooltipAlignPoints: IAlignPoint[] = [{ align: "cc tc", offset: { x: -20, y: 10 } }];
const bubbleAlignPoints: IAlignPoint[] = [{ align: "bc tc", offset: { x: -5, y: -5 } }];

const messages = defineMessages({
    showAsTable: {
        id: "controlButtons.asTable",
    },
    showAsOriginal: {
        id: "controlButtons.asOriginal",
    },
});

export function DrillDialog({
    insightTitle,
    breadcrumbs,
    onCloseDialog,
    onBackButtonClick,
    isBackButtonVisible,
    children,

    enableDrillDescription,
    exportAvailable,
    exportXLSXEnabled,
    exportCSVEnabled,
    exportCSVRawEnabled,
    exportPDFEnabled,
    exportPDFVisible,
    onExportCSV,
    onExportXLSX,
    onExportCSVRaw,
    onExportPDF,
    isLoading,
    isExporting,
    isExportRawVisible,
    accessibilityConfig = {},
    initialFocus,
    isShowAsTableVisible,
    isWidgetAsTable,
    onShowAsTable,
    focusCheckFn,
}: DrillDialogProps) {
    const [announcementText, setAnnouncementText] = useState<string>("");

    const canExport = useDashboardSelector(selectCanExportTabular);
    const enablePdfTabularExport = useDashboardSelector(selectEnableExportToPdfTabular);
    const settings = useDashboardSelector(selectSettings);
    const isAccessibilityModeEnabled = settings.enableAccessibilityMode === true;

    const titleWithBreadcrumbs = getTitleWithBreadcrumbs(insightTitle, breadcrumbs);

    const titleElementId = useId();

    const { formatMessage } = useIntl();

    const showAsTableButtonMessage = isWidgetAsTable ? messages.showAsOriginal : messages.showAsTable;

    const handleShowAsTableClick = useCallback(() => {
        // Announce what state we're changing TO (opposite of current state)
        const message = isWidgetAsTable
            ? formatMessage({ id: "controlButtons.announcement.switchedToOriginal" })
            : formatMessage({ id: "controlButtons.announcement.switchedToTable" });

        setAnnouncementText(message);
        onShowAsTable();
    }, [isWidgetAsTable, formatMessage, onShowAsTable]);

    return (
        <UiAutofocus refocusKey={titleWithBreadcrumbs}>
            <DialogBase
                submitOnEnterKey={false}
                className={cx("gd-drill-modal-dialog s-drill-modal-dialog", {
                    "gd-ff-drill-description": enableDrillDescription,
                })}
                onClose={onCloseDialog}
                displayCloseButton
                accessibilityConfig={{ ...accessibilityConfig, isModal: true, titleElementId }}
                initialFocus={initialFocus}
                returnFocusAfterClose
                shouldCloseOnEscape
                autofocusOnOpen
                focusCheckFn={focusCheckFn}
            >
                <div
                    className={cx(
                        "gd-dialog-header gd-dialog-header-with-border gd-drill-modal-dialog-header",
                        {
                            "gd-ff-drill-description": enableDrillDescription,
                        },
                    )}
                >
                    {isBackButtonVisible ? (
                        <BubbleHoverTrigger>
                            <Button
                                className="gd-button-primary gd-button-icon-only gd-icon-navigateleft s-drill-reset-button gd-drill-reset-button"
                                onClick={onBackButtonClick}
                                accessibilityConfig={{
                                    ariaLabel: formatMessage({ id: "drillModal.backToTop" }),
                                }}
                            />
                            <Bubble className="bubble-primary" alignPoints={bubbleAlignPoints}>
                                <FormattedMessage id="drillModal.backToTop" tagName="span" />
                            </Bubble>
                        </BubbleHoverTrigger>
                    ) : null}
                    <div className="gd-drill-title s-drill-title" id={titleElementId}>
                        <ShortenedText
                            tagName="div"
                            tooltipAlignPoints={tooltipAlignPoints}
                            tooltipVisibleOnMouseOver={false}
                        >
                            {titleWithBreadcrumbs}
                        </ShortenedText>
                    </div>
                </div>
                <div
                    className={cx("gd-drill-modal-dialog-content visualization", {
                        "gd-ff-drill-description": enableDrillDescription,
                    })}
                >
                    <div className="gd-drill-modal-dialog-content-base">{children}</div>
                </div>
                {canExport || isShowAsTableVisible ? (
                    <div className="gd-drill-modal-dialog-footer gd-drill-modal-dialog-footer-with-border s-drill-modal-dialog-footer">
                        {isShowAsTableVisible ? (
                            <UiButton
                                variant="tertiary"
                                onClick={handleShowAsTableClick}
                                iconBefore={isWidgetAsTable ? "visualization" : "table"}
                                label={formatMessage(showAsTableButtonMessage)}
                            />
                        ) : null}
                        {canExport ? (
                            <DrillDialogExportDropdown
                                exportAvailable={exportAvailable}
                                exportXLSXEnabled={exportXLSXEnabled}
                                exportCSVEnabled={exportCSVEnabled}
                                exportCSVRawEnabled={exportCSVRawEnabled}
                                exportPDFEnabled={exportPDFEnabled}
                                exportPDFVisible={
                                    exportPDFVisible ||
                                    (isWidgetAsTable && enablePdfTabularExport && !isAccessibilityModeEnabled)
                                }
                                onExportXLSX={onExportXLSX}
                                onExportCSV={onExportCSV}
                                onExportCSVRaw={onExportCSVRaw}
                                onExportPDF={onExportPDF}
                                isLoading={isLoading}
                                isExporting={isExporting}
                                isExportRawVisible={isExportRawVisible}
                            />
                        ) : null}
                    </div>
                ) : null}

                <div className="sr-only" aria-live="polite" aria-atomic="true" role="status">
                    {announcementText}
                </div>
            </DialogBase>
        </UiAutofocus>
    );
}
