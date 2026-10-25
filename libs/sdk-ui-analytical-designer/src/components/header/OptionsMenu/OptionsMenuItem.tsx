// (C) 2007-2026 GoodData Corporation

import { type ReactNode, memo } from "react";

import classNames from "classnames";
import { type IntlShape, useIntl } from "react-intl";

import { Bubble, BubbleHoverTrigger, Item } from "@gooddata/sdk-ui-kit";

const noopString = () => "";

interface IOptionsMenuItemProps {
    bubbleId: string;
    bubbleTextProvider?: (intl: IntlShape) => string;
    className: string;
    isDisabled: boolean;
    titleId: string;
    onClick: () => void;
}

export const OptionsMenuItem = memo(function OptionsMenuItem({
    bubbleId,
    bubbleTextProvider = noopString,
    className,
    isDisabled,
    titleId,
    onClick,
}: IOptionsMenuItemProps) {
    const intl = useIntl();

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
        const button = <Item className={itemClasses}>{intl.formatMessage({ id: titleId })}</Item>;
        const bubbleMessage = bubbleTextProvider(intl);
        if (bubbleMessage) {
            return renderBubble(bubbleId, button, bubbleMessage);
        } else {
            return button;
        }
    } else {
        return (
            <Item className={itemClasses} onClick={onClick}>
                {intl.formatMessage({ id: titleId })}
            </Item>
        );
    }
});
