// (C) 2021-2026 GoodData Corporation

import { type ReactNode } from "react";

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

/**
 * Imperative API exposed by the FlexDimensions component through its ref.
 *
 * @internal
 */
export interface IFlexDimensionsHandle {
    updateSize: () => void;
}
