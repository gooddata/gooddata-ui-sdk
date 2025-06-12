// (C) 2019-2022 GoodData Corporation
import React, { useRef, useImperativeHandle, useMemo, useCallback } from "react";

import { ScrollContext, isElementInvisibleType } from "./ScrollContext.js";
import { handleOnScrollEvent } from "../utils/scroll.js";

/**
 * @internal
 */
export interface IScrollablePanelProps extends React.HTMLAttributes<HTMLDivElement> {
    scrollToVisible?: (element: HTMLElement, container: HTMLElement, bottomMargin: number) => void;
    tagName?: React.ElementType;
}

const DEFAULT_BOTTOM_MARGIN = 5;

const scrollToVisibleDefault = (element: HTMLElement, container: HTMLElement, bottomMargin: number) => {
    container.scrollTop = element.offsetTop - container.offsetTop - bottomMargin;
};

const isElementInvisibleCheckDefault: isElementInvisibleType = (
    element: HTMLElement,
    container: HTMLElement,
): boolean => {
    if (element && container) {
        const offset = element.offsetTop - container.offsetTop;
        const itemHeight = element.clientHeight;
        const parentHeight = container.clientHeight;
        return parentHeight < offset + itemHeight;
    }
    return false;
};

/**
 * @internal
 */
export const ScrollablePanel = React.forwardRef<HTMLDivElement | undefined, IScrollablePanelProps>(
    function ScrollablePanel(props, ref) {
        const {
            tagName: TagName = "div",
            scrollToVisible = scrollToVisibleDefault,
            children,
            ...divProps
        } = props;
        const containerRef = useRef<HTMLDivElement>();
        useImperativeHandle(ref, () => containerRef.current);

        const memoizeContext = useMemo(() => {
            return {
                scrollIntoView: (
                    element: HTMLElement,
                    bottomMargin = DEFAULT_BOTTOM_MARGIN,
                    isElementInvisibleCheck = isElementInvisibleCheckDefault,
                ) => {
                    if (containerRef.current) {
                        const container = containerRef.current;
                        if (isElementInvisibleCheck(element, container)) {
                            scrollToVisible(element, container, bottomMargin);
                        }
                    }
                },
            };
        }, [scrollToVisible, containerRef]);

        const onPanelScroll = useCallback(() => {
            if (containerRef?.current) {
                handleOnScrollEvent(containerRef.current);
            }
        }, []);

        return (
            <ScrollContext.Provider value={memoizeContext}>
                <TagName {...divProps} ref={containerRef} onScroll={onPanelScroll}>
                    {children}
                </TagName>
            </ScrollContext.Provider>
        );
    },
);
