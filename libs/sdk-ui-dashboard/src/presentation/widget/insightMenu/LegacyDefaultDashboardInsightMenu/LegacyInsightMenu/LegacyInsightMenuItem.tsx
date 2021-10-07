// (C) 2019-2021 GoodData Corporation
import React from "react";
import cx from "classnames";
import { Bubble, BubbleHoverTrigger, IAlignPoint, Item } from "@gooddata/sdk-ui-kit";

interface ILegacyInsightMenuItemProps {
    bubbleId: string;
    bubbleMessage?: string;
    className?: string;
    isDisabled?: boolean;
    title: string;
    onClick?: () => void;
}

const alignPoints: IAlignPoint[] = [{ align: "cl cr" }];

export const LegacyInsightMenuItem: React.FC<ILegacyInsightMenuItemProps> = ({
    bubbleId,
    className,
    isDisabled,
    onClick,
    title,
    bubbleMessage = "",
}) => {
    const itemClasses = cx("gd-list-item", "gd-menu-item", className, { "is-disabled": isDisabled });

    if (isDisabled) {
        const button = <Item className={itemClasses}>{title}</Item>;

        if (bubbleMessage) {
            return (
                <BubbleHoverTrigger className="s-gd-bubble-trigger-options-menu-item">
                    {button}
                    <Bubble
                        className={`bubble-primary bubble-primary-${bubbleId} s-bubble-primary-${bubbleId}`}
                        alignPoints={alignPoints}
                    >
                        {bubbleMessage}
                    </Bubble>
                </BubbleHoverTrigger>
            );
        } else {
            return button;
        }
    } else {
        return (
            <Item className={itemClasses} onClick={onClick}>
                {title}
            </Item>
        );
    }
};
