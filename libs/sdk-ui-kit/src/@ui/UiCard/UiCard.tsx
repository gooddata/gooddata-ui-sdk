// (C) 2024-2026 GoodData Corporation

import { type ReactNode, forwardRef } from "react";

import { bem } from "../@utils/bem.js";

/**
 * @internal
 */
export interface IUiCardProps {
    elevation?: "1" | "2";
    tabIndex?: number;
    children?: ReactNode;
}

const { b } = bem("gd-ui-kit-card");

/**
 * @internal
 */
export const UiCard = forwardRef<HTMLDivElement, IUiCardProps>(function UiCard(
    { children, tabIndex, elevation = "1" },
    ref,
) {
    return (
        <div className={b({ elevation })} ref={ref} tabIndex={tabIndex}>
            {children}
        </div>
    );
});
