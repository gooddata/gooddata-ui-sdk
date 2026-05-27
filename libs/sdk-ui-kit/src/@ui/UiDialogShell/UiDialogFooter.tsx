// (C) 2026 GoodData Corporation

import { type ReactNode } from "react";

import { bem } from "../@utils/bem.js";

const { b } = bem("gd-ui-kit-dialog-footer");

/**
 * @internal
 */
export interface IUiDialogFooterProps {
    /** Right-aligned cluster of footer controls (typically Cancel + primary). */
    children: ReactNode;
    /**
     * When true, draws a 1px complementary-3 divider above the footer and adds
     * matching top padding. ObjectShareDialog and AddGranteeScreen want this;
     * ConfirmDialog does not.
     */
    divider?: boolean;
}

/**
 * Dialog footer: right-aligned cluster of action buttons. Optionally renders
 * a 1px divider above the actions.
 *
 * @internal
 */
export function UiDialogFooter({ children, divider = false }: IUiDialogFooterProps) {
    return <div className={b({ divider })}>{children}</div>;
}
