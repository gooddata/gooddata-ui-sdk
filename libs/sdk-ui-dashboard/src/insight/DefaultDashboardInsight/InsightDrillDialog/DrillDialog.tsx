// (C) 2019-2021 GoodData Corporation
import React from "react";
import { useIntl } from "react-intl";
import { Button, Bubble, BubbleHoverTrigger, ShortenedText } from "@gooddata/sdk-ui-kit";
import { PoweredByGDLogo } from "./PoweredByGDLogo";

export interface DrillDialogProps {
    title: string;
    breadcrumbs: string[];
    onCloseDialog: () => void;
    onBackButtonClick: () => void;
    isBackButtonVisible?: boolean;
    children: React.ReactNode;
}

export const DrillDialog: React.FC<DrillDialogProps> = ({
    title,
    breadcrumbs,
    onCloseDialog,
    onBackButtonClick,
    isBackButtonVisible,
    children,
}) => {
    const intl = useIntl();
    const renderTitle = () => {
        const separator = "\u203A";

        return breadcrumbs.length > 0
            ? `${title} ${separator} ${breadcrumbs.filter(Boolean).join(` ${separator} `)}`
            : title;
    };

    const tooltipAlignPoints = [{ align: "cc tc", offset: { x: -20, y: 10 } }];

    return (
        <div className="gd-dialog gd-drill-modal-dialog s-drill-modal-dialog">
            <div className="gd-dialog-header gd-dialog-header-with-border gd-drill-modal-dialog-header">
                {isBackButtonVisible && (
                    <BubbleHoverTrigger>
                        <Button
                            className="gd-button-primary gd-button-icon-only gd-icon-navigateleft s-drill-reset-button gd-drill-reset-button"
                            onClick={onBackButtonClick}
                        />
                        <Bubble
                            className="bubble-primary"
                            alignPoints={[{ align: "bc tc", offset: { x: -5, y: -5 } }]}
                        >
                            <span>{intl.formatMessage({ id: "drillModal.backToTop" })}</span>
                        </Bubble>
                    </BubbleHoverTrigger>
                )}
                <div className="gd-drill-title s-drill-title">
                    <ShortenedText
                        tagName="div"
                        tooltipAlignPoints={tooltipAlignPoints}
                        tooltipVisibleOnMouseOver={false}
                    >
                        {renderTitle()}
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
            <PoweredByGDLogo isSmall />
        </div>
    );
};
