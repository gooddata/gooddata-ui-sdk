// (C) 2022-2025 GoodData Corporation

import { MouseEvent, ReactNode } from "react";

/**
 * @internal
 */
export interface IScrollGradientProps {
    size?: number;
    onScroll?: (event: MouseEvent<HTMLDivElement>) => void;
    className?: string;
    contentClassName?: string;
    backgroundColor?: string;
    children?: ReactNode;
}
