// (C) 2022 GoodData Corporation
import React from "react";
import { Button } from "../../Button/index.js";
import { LoadingSpinner } from "../../LoadingSpinner/index.js";
import { SettingWidget } from "../SettingWidget.js";
import { Header } from "../Header.js";
import { Footer } from "../Footer.js";
import { Separator } from "../Separator.js";
import { Title } from "../Title.js";
import { FooterButtons } from "../FooterButtons.js";
import { Hyperlink } from "../../Hyperlink/index.js";

/**
 * @internal
 */
export interface ISimpleSettingWidgetProps {
    title: string;
    currentSettingStatus: string;
    titleTooltip: string;
    helpLinkText?: string;
    helpLinkUrl?: string;
    actionButtonText: string;
    isLoading: boolean;
    onSubmit: () => void;
    onHelpLinkClick?: () => void;
}

/**
 * This widget toggles one setting on/off.
 *
 * @internal
 */
export const SimpleSettingWidget: React.FC<ISimpleSettingWidgetProps> = (props) => {
    const {
        title,
        currentSettingStatus,
        titleTooltip,
        helpLinkText,
        helpLinkUrl,
        actionButtonText,
        isLoading,
        onSubmit,
        onHelpLinkClick,
    } = props;

    return (
        <SettingWidget>
            <Header>
                <Title title={title} tooltip={titleTooltip} />
                {isLoading ? (
                    <LoadingSpinner className="small gd-loading-equalizer-spinner" />
                ) : (
                    <span className="gd-setting-widget-status-pill">{currentSettingStatus}</span>
                )}
            </Header>
            <Separator />
            <Footer>
                {helpLinkText && helpLinkUrl ? (
                    <Hyperlink
                        text={helpLinkText}
                        href={helpLinkUrl}
                        iconClass="gd-icon-circle-question"
                        onClick={onHelpLinkClick}
                    />
                ) : null}
                {!isLoading ? (
                    <FooterButtons>
                        <Button
                            className="gd-button-action"
                            onClick={onSubmit}
                            disabled={isLoading}
                            value={actionButtonText}
                        />
                    </FooterButtons>
                ) : null}
            </Footer>
        </SettingWidget>
    );
};
