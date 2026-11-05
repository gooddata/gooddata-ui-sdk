// (C) 2007-2026 GoodData Corporation

import { type ReactNode, memo } from "react";

import classNames from "classnames";

import { Bubble, BubbleHoverTrigger, Item } from "@gooddata/sdk-ui-kit";

interface IOptionsMenuItemProps {
    bubbleId: string;
    disabledTooltip?: string;
    className: string;
    isDisabled: boolean;
    label: string;
    onClick: () => void;
}

export const OptionsMenuItem = memo(function OptionsMenuItem({
    bubbleId,
    disabledTooltip,
    className,
    isDisabled,
    label,
    onClick,
}: IOptionsMenuItemProps) {
    const getItemClasses = (customClassName: string, isDisabled: boolean) => {
        return classNames("gd-list-item", "gd-menu-item", customClassName, { "is-disabled": isDisabled });
    };

    const renderBubble = (key: string, children: ReactNode, message: string) => {
        return (
            <BubbleHoverTrigger key={key} className="s-gd-bubble-trigger-options-menu-item">
                {children}
                <Bubble
                    className={`bubble-primary bubble-primary-${key} s-bubble-primary-${key}`}
                    alignPoints={[{ align: "cl cr" }]}
                >
                    {message}
                </Bubble>
            </BubbleHoverTrigger>
        );
    };

    const itemClasses = getItemClasses(className, isDisabled);

    if (isDisabled) {
        const button = <Item className={itemClasses}>{label}</Item>;
        if (disabledTooltip) {
            return renderBubble(bubbleId, button, disabledTooltip);
        } else {
            return button;
        }
    } else {
        return (
            <Item className={itemClasses} onClick={onClick}>
                {label}
            </Item>
        );
    }
});
