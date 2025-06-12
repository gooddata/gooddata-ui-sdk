// (C) 2022-2023 GoodData Corporation

import React, { useCallback } from "react";
import cx from "classnames";

import { Typography } from "../../Typography/index.js";
import { Bubble, BubbleHoverTrigger } from "../../Bubble/index.js";

const BUTTON_TOOLTIP_ALIGN_POINTS = [
    { align: "cr cl", offset: { x: 0, y: 0 } },
    { align: "cl cr", offset: { x: 0, y: 0 } },
];

/**
 * @internal
 */
export interface IDialogListHeaderProps {
    className?: string;
    gdIconName?: string;
    title?: string;
    buttonTitle?: string;
    buttonDisabled?: boolean;
    buttonTooltipText?: string;
    onButtonClick?: () => void;
}

/**
 * @internal
 */
export const DialogListHeader: React.VFC<IDialogListHeaderProps> = (props) => {
    const {
        className,
        gdIconName = "gd-icon-plus",
        title,
        buttonTitle,
        buttonDisabled,
        buttonTooltipText,
        onButtonClick,
    } = props;
    const headerClassNames = cx("gd-dialog-list-header s-dialog-list-header", className);
    const buttonClassNames = cx("gd-button", "gd-button-link", gdIconName, "s-dialog-list-header-button", {
        disabled: buttonDisabled,
    });

    const onClick = useCallback(() => !buttonDisabled && onButtonClick?.(), [buttonDisabled, onButtonClick]);

    return (
        <div role="dialog-list-header" className={headerClassNames}>
            {title ? (
                <div>
                    <Typography tagName="h3">{title}</Typography>
                </div>
            ) : null}
            <div className="gd-dialog-list-header-divider" />
            {buttonTitle ? (
                <div className="gd-dialog-list-header-button">
                    <BubbleHoverTrigger showDelay={0} hideDelay={0}>
                        <a
                            className={buttonClassNames}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={onClick}
                        >
                            {buttonTitle}
                        </a>
                        {buttonTooltipText ? (
                            <Bubble className="bubble-primary" alignPoints={BUTTON_TOOLTIP_ALIGN_POINTS}>
                                {buttonTooltipText}
                            </Bubble>
                        ) : null}
                    </BubbleHoverTrigger>
                </div>
            ) : null}
        </div>
    );
};
