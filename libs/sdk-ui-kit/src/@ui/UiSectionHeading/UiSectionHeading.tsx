// (C) 2026 GoodData Corporation

import { type ReactNode } from "react";

import { bem } from "../@utils/bem.js";

const { b, e } = bem("gd-ui-kit-section-heading");

/**
 * @internal
 */
export interface IUiSectionHeadingProps {
    /** Section label rendered in 11px upper-case complementary-6. */
    label: string;
    /** Optional action rendered after the rule (e.g. a link or button). */
    action?: ReactNode;
}

/**
 * "LABEL ────── action" pattern used by dialog sections (e.g. SHARED WITH +
 * Add link). The horizontal rule fills the space between the label and the
 * trailing action.
 *
 * @internal
 */
export function UiSectionHeading({ label, action }: IUiSectionHeadingProps) {
    return (
        <div className={b()}>
            <span className={e("label")}>{label}</span>
            <span className={e("rule")} role="separator" />
            {action ? <span className={e("action")}>{action}</span> : null}
        </div>
    );
}
