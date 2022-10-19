// (C) 2022 GoodData Corporation
import React from "react";
import { Button } from "../../Button";
import { LoadingSpinner } from "../../LoadingSpinner";
import { SettingWidget } from "../SettingWidget";
import { Header } from "../Header";
import { Footer } from "../Footer";
import { Separator } from "../Separator";
import { Title } from "../Title";
import { FooterButtons } from "../FooterButtons";
import { Hyperlink } from "../../Hyperlink";

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
