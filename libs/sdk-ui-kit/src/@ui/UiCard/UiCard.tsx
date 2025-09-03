// (C) 2024-2025 GoodData Corporation

import React, { forwardRef } from "react";

import { bem } from "../@utils/bem.js";

/**
 * @internal
 */
export interface UiCardProps {
    elevation?: "1" | "2";
    tabIndex?: number;
    children?: React.ReactNode;
}

const { b } = bem("gd-ui-kit-card");

/**
 * @internal
 */
export const UiCard = forwardRef<HTMLDivElement, UiCardProps>(function UiCard(
    { children, tabIndex, elevation = "1" },
    ref,
) {
    return (
        <div className={b({ elevation })} ref={ref} tabIndex={tabIndex}>
            {children}
        </div>
    );
});
