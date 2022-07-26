// (C) 2022 GoodData Corporation

import React from "react";
import { useIntl } from "react-intl";
import { Message } from "../Messages";
import { Button } from "../Button";

interface IStylingPickerFooterProps {
    showButtons: boolean;
    disableButtons: boolean;
    isMobile: boolean;
    footerHelpLink?: string;
    footerHelpTitle?: string;
    footerMobileMessage?: string;
    onApply: () => void;
    onCancel: () => void;
}

export const StylingPickerFooter: React.FC<IStylingPickerFooterProps> = ({
    showButtons,
    disableButtons,
    isMobile,
    footerHelpLink,
    footerHelpTitle,
    footerMobileMessage,
    onApply,
    onCancel,
}) => {
    const intl = useIntl();

    return (
        <div className="gd-styling-picker-footer">
            {isMobile && footerMobileMessage && (
                <div className="gd-styling-picker-footer-message">
                    <Message type="progress">{footerMobileMessage}</Message>
                </div>
            )}
            {footerHelpLink && footerHelpTitle && (
                <div className="gd-styling-picker-footer-help s-styling-picker-footer-help">
                    <span className="gd-icon-circle-question gd-styling-picker-footer-icon" />
                    <span className="gd-styling-picker-footer-text">
                        <a
                            className="gd-button-link-dimmed"
                            rel="noopener noreferrer"
                            target="_blank"
                            href={footerHelpLink}
                        >
                            {footerHelpTitle}
                        </a>
                    </span>
                </div>
            )}
            {showButtons && (
                <div className="gd-styling-picker-footer-buttons s-styling-picker-footer-buttons">
                    <Button
                        className="gd-button-secondary"
                        value={intl.formatMessage({ id: "cancel" })}
                        disabled={disableButtons}
                        onClick={onCancel}
                    />
                    <Button
                        className="gd-button-action"
                        value={intl.formatMessage({ id: "apply" })}
                        disabled={disableButtons}
                        onClick={onApply}
                    />
                </div>
            )}
        </div>
    );
};
