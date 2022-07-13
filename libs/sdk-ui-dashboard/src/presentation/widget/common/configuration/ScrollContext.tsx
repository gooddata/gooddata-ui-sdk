// (C) 2019-2022 GoodData Corporation
import React, { useContext } from "react";

export const useScrollContext = () => useContext(ScrollContext);
export type isElementInvisibleType = (element: HTMLElement, container: HTMLElement) => boolean;

export const scrollContextDefault = {
    scrollIntoView: (
        _element: HTMLElement,
        _bottomMargin?: number,
        _isElementInvisibleCheck?: isElementInvisibleType,
    ) => {},
};

export const ScrollContext = React.createContext(scrollContextDefault);
