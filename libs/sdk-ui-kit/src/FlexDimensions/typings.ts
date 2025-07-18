// (C) 2021-2025 GoodData Corporation

import { ReactNode } from "react";

/**
 * @internal
 */
export interface IFlexDimensionsProps {
    children?: ReactNode;
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
