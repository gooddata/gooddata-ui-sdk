// (C) 2022 GoodData Corporation

import React from "react";

/**
 * @internal
 */
export interface IScrollGradientProps {
    size?: number;
    onScroll?: (event: React.MouseEvent<HTMLDivElement>) => void;
    className?: string;
    contentClassName?: string;
    backgroundColor?: string;
}
