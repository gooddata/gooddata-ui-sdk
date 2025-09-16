// (C) 2019-2025 GoodData Corporation

import { createContext, useContext } from "react";

/**
 * @internal
 */
export const useScrollContext = () => useContext(ScrollContext);

/**
 * @internal
 */
export type isElementInvisibleType = (element: HTMLElement, container: HTMLElement) => boolean;

/**
 * @internal
 */
export const scrollContextDefault = {
    scrollIntoView: (
        _element: HTMLElement,
        _bottomMargin?: number,
        _isElementInvisibleCheck?: isElementInvisibleType,
    ) => {},
};

export const ScrollContext = createContext(scrollContextDefault);
