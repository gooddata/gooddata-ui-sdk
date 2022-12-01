// (C) 2022 GoodData Corporation

import React, { useEffect, useRef } from "react";

import { isElementInvisibleType, useScrollContext } from "./ScrollContext";

/**
 * @internal
 */
export interface IScrollableItemProps {
    scrollIntoView: boolean;
    className?: string;
    bottomMargin?: number;
    isElementInvisibleCheck?: isElementInvisibleType;
    tagName?: React.ElementType;
}

/**
 * @internal
 */
export const ScrollableItem: React.FunctionComponent<IScrollableItemProps> = (props) => {
    const item = useRef<HTMLDivElement>(null);
    const scroll = useScrollContext();
    const {
        scrollIntoView,
        bottomMargin,
        isElementInvisibleCheck,
        className,
        children,
        tagName: TagName = "div",
    } = props;

    useEffect(() => {
        if (scrollIntoView) {
            const element = item.current;
            scroll.scrollIntoView(element, bottomMargin, isElementInvisibleCheck);
        }
    }, [bottomMargin, isElementInvisibleCheck, scroll, scrollIntoView, item]);

    return (
        <TagName className={className} ref={item}>
            {children}
        </TagName>
    );
};
