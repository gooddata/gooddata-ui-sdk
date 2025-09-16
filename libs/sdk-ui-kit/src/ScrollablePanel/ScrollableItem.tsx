// (C) 2022-2025 GoodData Corporation

import { ElementType, ReactNode, useEffect, useRef } from "react";

import { isElementInvisibleType, useScrollContext } from "./ScrollContext.js";

/**
 * @internal
 */
export interface IScrollableItemProps {
    scrollIntoView: boolean;
    className?: string;
    bottomMargin?: number;
    isElementInvisibleCheck?: isElementInvisibleType;
    tagName?: ElementType;
    onItemScrolled?: () => void;
    children?: ReactNode;
}

/**
 * @internal
 */
export function ScrollableItem(props: IScrollableItemProps) {
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
}
