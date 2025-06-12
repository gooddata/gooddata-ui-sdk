// (C) 2021 GoodData Corporation

import React from "react";

/**
 * @internal
 */
export interface IFlexDimensionsProps {
    children?: React.ReactNode;
    className?: string;
    measureHeight?: boolean;
    measureWidth?: boolean;
}

/**
 * @internal
 */
export interface IFlexDimensionsState {
    width: number;
    height: number;
}
