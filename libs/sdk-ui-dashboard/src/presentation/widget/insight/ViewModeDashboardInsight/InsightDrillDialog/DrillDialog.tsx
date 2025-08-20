// (C) 2019-2025 GoodData Corporation
import React from "react";

import cx from "classnames";
import { FormattedMessage, defineMessages, useIntl } from "react-intl";

import {
    Bubble,
    BubbleHoverTrigger,
    Button,
    DialogBase,
    IAlignPoint,
    IDialogBaseProps,
    ShortenedText,
    UiButton,
    useId,
} from "@gooddata/sdk-ui-kit";

import { DrillDialogExportDropdown } from "./DrillDialogExportDropdown.js";
import { getTitleWithBreadcrumbs } from "./getTitleWithBreadcrumbs.js";
import { PoweredByGDLogo } from "./PoweredByGDLogo.js";
import { selectCanExportTabular, selectSettings, useDashboardSelector } from "../../../../../model/index.js";

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
    children: React.ReactNode;

    exportAvailable: boolean;
    onExportXLSX: () => void;
    onExportCSV: () => void;
    onExportCSVRaw: () => void;
    exportXLSXEnabled: boolean;
    exportCSVEnabled: boolean;
    exportCSVRawEnabled: boolean;
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

export const DrillDialog: React.FC<DrillDialogProps> = ({
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
    onExportCSV,
    onExportXLSX,
    onExportCSVRaw,
    isLoading,
    isExporting,
    isExportRawVisible,
    accessibilityConfig = {},
    initialFocus,
    isShowAsTableVisible,
    isWidgetAsTable,
    onShowAsTable,
    focusCheckFn,
}) => {
    const settings = useDashboardSelector(selectSettings);
    const canExport = useDashboardSelector(selectCanExportTabular);
    const shouldShowDrilledInsightExport = settings?.enableDrilledInsightExport && canExport;

    const titleWithBreadcrumbs = getTitleWithBreadcrumbs(insightTitle, breadcrumbs);

    const titleElementId = useId();

    const { formatMessage } = useIntl();

    const showAsTableButtonMessage = isWidgetAsTable ? messages.showAsOriginal : messages.showAsTable;

    return (
        <DialogBase
            submitOnEnterKey={false}
            className={cx("gd-drill-modal-dialog s-drill-modal-dialog", {
                "gd-ff-drill-description": enableDrillDescription,
            })}
            onClose={onCloseDialog}
            displayCloseButton={true}
            accessibilityConfig={{ ...accessibilityConfig, isModal: true, titleElementId }}
            initialFocus={initialFocus}
            returnFocusTo={accessibilityConfig?.dialogId}
            returnFocusAfterClose
            shouldCloseOnEscape={true}
            autofocusOnOpen={true}
            focusCheckFn={focusCheckFn}
        >
            <div
                className={cx("gd-dialog-header gd-dialog-header-with-border gd-drill-modal-dialog-header", {
                    "gd-ff-drill-description": enableDrillDescription,
                })}
            >
                {isBackButtonVisible ? (
                    <BubbleHoverTrigger>
                        <Button
                            className="gd-button-primary gd-button-icon-only gd-icon-navigateleft s-drill-reset-button gd-drill-reset-button"
                            onClick={onBackButtonClick}
                            accessibilityConfig={{ ariaLabel: formatMessage({ id: "drillModal.backToTop" }) }}
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
            {shouldShowDrilledInsightExport || isShowAsTableVisible ? (
                <div className="gd-drill-modal-dialog-footer gd-drill-modal-dialog-footer-with-border s-drill-modal-dialog-footer">
                    {isShowAsTableVisible ? (
                        <UiButton
                            variant="tertiary"
                            onClick={onShowAsTable}
                            iconBefore={isWidgetAsTable ? "visualization" : "table"}
                            label={formatMessage(showAsTableButtonMessage)}
                        />
                    ) : null}
                    {shouldShowDrilledInsightExport ? (
                        <DrillDialogExportDropdown
                            exportAvailable={exportAvailable}
                            exportXLSXEnabled={exportXLSXEnabled}
                            exportCSVEnabled={exportCSVEnabled}
                            exportCSVRawEnabled={exportCSVRawEnabled}
                            onExportXLSX={onExportXLSX}
                            onExportCSV={onExportCSV}
                            onExportCSVRaw={onExportCSVRaw}
                            isLoading={isLoading}
                            isExporting={isExporting}
                            isExportRawVisible={isExportRawVisible}
                        />
                    ) : null}
                </div>
            ) : null}
            <PoweredByGDLogo isSmall />
        </DialogBase>
    );
};
