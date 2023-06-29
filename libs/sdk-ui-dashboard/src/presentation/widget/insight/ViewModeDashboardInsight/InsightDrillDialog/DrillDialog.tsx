// (C) 2019-2022 GoodData Corporation
import React from "react";
import { FormattedMessage } from "react-intl";
import { Button, Bubble, BubbleHoverTrigger, ShortenedText, IAlignPoint } from "@gooddata/sdk-ui-kit";
import { selectCanExportTabular, selectSettings, useDashboardSelector } from "../../../../../model/index.js";
import { PoweredByGDLogo } from "./PoweredByGDLogo.js";
import { DrillModalFooter } from "./DrillModalFooter.js";
import { getTitleWithBreadcrumbs } from "./getTitleWithBreadcrumbs.js";

export interface DrillDialogProps {
    insightTitle: string;
    breadcrumbs: string[];
    onCloseDialog: () => void;
    onBackButtonClick: () => void;
    isBackButtonVisible?: boolean;
    children: React.ReactNode;

    exportAvailable: boolean;
    onExportXLSX: () => void;
    onExportCSV: () => void;
    exportXLSXEnabled: boolean;
    exportCSVEnabled: boolean;
    isLoading: boolean;
}

const tooltipAlignPoints: IAlignPoint[] = [{ align: "cc tc", offset: { x: -20, y: 10 } }];
const bubbleAlignPoints: IAlignPoint[] = [{ align: "bc tc", offset: { x: -5, y: -5 } }];

export const DrillDialog: React.FC<DrillDialogProps> = ({
    insightTitle,
    breadcrumbs,
    onCloseDialog,
    onBackButtonClick,
    isBackButtonVisible,
    children,

    exportAvailable,
    exportXLSXEnabled,
    exportCSVEnabled,
    onExportCSV,
    onExportXLSX,
    isLoading,
}) => {
    const settings = useDashboardSelector(selectSettings);
    const canExport = useDashboardSelector(selectCanExportTabular);
    const shouldShowDrilledInsightExport = settings?.enableDrilledInsightExport && canExport;

    const titleWithBreadcrumbs = getTitleWithBreadcrumbs(insightTitle, breadcrumbs);

    return (
        <div className="gd-dialog gd-drill-modal-dialog s-drill-modal-dialog">
            <div className="gd-dialog-header gd-dialog-header-with-border gd-drill-modal-dialog-header">
                {isBackButtonVisible ? (
                    <BubbleHoverTrigger>
                        <Button
                            className="gd-button-primary gd-button-icon-only gd-icon-navigateleft s-drill-reset-button gd-drill-reset-button"
                            onClick={onBackButtonClick}
                        />
                        <Bubble className="bubble-primary" alignPoints={bubbleAlignPoints}>
                            <FormattedMessage id="drillModal.backToTop" tagName="span" />
                        </Bubble>
                    </BubbleHoverTrigger>
                ) : null}
                <div className="gd-drill-title s-drill-title">
                    <ShortenedText
                        tagName="div"
                        tooltipAlignPoints={tooltipAlignPoints}
                        tooltipVisibleOnMouseOver={false}
                    >
                        {titleWithBreadcrumbs}
                    </ShortenedText>
                </div>
                <Button
                    className="gd-button-link gd-button-icon-only gd-icon-cross gd-drill-close-button s-drill-close-button"
                    onClick={onCloseDialog}
                />
            </div>
            <div className="gd-drill-modal-dialog-content visualization">
                <div className="gd-drill-modal-dialog-content-base">{children}</div>
            </div>
            {shouldShowDrilledInsightExport ? (
                <div className="gd-drill-modal-dialog-footer gd-drill-modal-dialog-footer-with-border s-drill-modal-dialog-footer">
                    <DrillModalFooter
                        exportAvailable={exportAvailable}
                        exportXLSXEnabled={exportXLSXEnabled}
                        exportCSVEnabled={exportCSVEnabled}
                        onExportXLSX={onExportXLSX}
                        onExportCSV={onExportCSV}
                        isLoading={isLoading}
                    />
                </div>
            ) : null}
            <PoweredByGDLogo isSmall />
        </div>
    );
};
