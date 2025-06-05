// (C) 2024-2025 GoodData Corporation

import React, { useCallback } from "react";
import cx from "classnames";
import { BubbleHoverTrigger } from "../Bubble/BubbleHoverTrigger.js";
import { Button } from "../Button/Button.js";
import { Bubble } from "../Bubble/Bubble.js";
import { IAlignPoint } from "../typings/positioning.js";

const defaultTooltipAlignPoints = [{ align: "cl cr" }, { align: "cr cl" }];

/**
 * @internal
 */
export interface IAddButtonProps {
    title: JSX.Element;
    isDisabled?: boolean;
    onClick?: () => void;
    tooltip?: JSX.Element;
    tooltipAlignPoints?: IAlignPoint[];
    className?: string;
}

/**
 * @internal
 */
export const AddButton: React.FC<IAddButtonProps> = (props) => {
    const {
        title,
        isDisabled,
        onClick,
        tooltip,
        tooltipAlignPoints = defaultTooltipAlignPoints,
        className,
    } = props;

    const buttonClassNames = cx(
        {
            disabled: isDisabled,
        },
        "gd-button-link",
        "gd-icon-plus",
        "s-add-button",
        className,
    );

    const handleClick = useCallback(
        (e: React.MouseEvent) => {
            e.preventDefault();
            if (isDisabled) {
                return;
            }
            onClick?.();
        },
        [isDisabled, onClick],
    );

    if (!tooltip) {
        return (
            <Button className={buttonClassNames} onClick={handleClick}>
                {title}
            </Button>
        );
    }

    return (
        <BubbleHoverTrigger showDelay={0} hideDelay={0}>
            <Button className={buttonClassNames} onClick={handleClick}>
                {title}
            </Button>
            <Bubble className="bubble-primary" alignPoints={tooltipAlignPoints}>
                {tooltip}
            </Bubble>
        </BubbleHoverTrigger>
    );
};
