// (C) 2022-2023 GoodData Corporation

import React, { useEffect, useRef } from "react";

import { isElementInvisibleType, useScrollContext } from "./ScrollContext.js";

/**
 * @internal
 */
export interface IScrollableItemProps {
    scrollIntoView: boolean;
    className?: string;
    bottomMargin?: number;
    isElementInvisibleCheck?: isElementInvisibleType;
    tagName?: React.ElementType;
    onItemScrolled?: () => void;
    children?: React.ReactNode;
}

/**
 * @internal
 */
export const ScrollableItem: React.FC<IScrollableItemProps> = (props) => {
    const item = useRef<HTMLDivElement>(null);
    const scroll = useScrollContext();
    const {
        scrollIntoView,
        bottomMargin,
        isElementInvisibleCheck,
        className,
        children,
        onItemScrolled,
        tagName: TagName = "div",
    } = props;

    useEffect(() => {
        if (scrollIntoView) {
            const element = item.current;
            scroll.scrollIntoView(element, bottomMargin, isElementInvisibleCheck);
            if (onItemScrolled) {
                onItemScrolled();
            }
        }
    }, [bottomMargin, isElementInvisibleCheck, scroll, scrollIntoView, item, onItemScrolled]);

    return (
        <TagName className={className} ref={item}>
            {children}
        </TagName>
    );
};
