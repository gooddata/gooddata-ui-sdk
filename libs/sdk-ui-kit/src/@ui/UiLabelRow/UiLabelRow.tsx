// (C) 2026 GoodData Corporation

import { type ReactNode } from "react";

import { bem } from "../@utils/bem.js";
import { UiIcon } from "../UiIcon/UiIcon.js";

const { b, e } = bem("gd-ui-kit-label-row");

/**
 * Display-form kind. Drives the icon only — the trailing suffix text is
 * supplied by the caller via `suffix`. Omit for a regular label.
 *
 * @internal
 */
export type LabelRowKind = "primary" | "default";

/**
 * @internal
 */
export interface IUiLabelRowProps {
    /** Label text. */
    label: string;
    /** Determines the leading icon. Omit for a generic label icon. */
    kind?: LabelRowKind;
    /**
     * Optional trailing suffix text rendered after the label (e.g.
     * "Primary key", "Default label"). The kit primitive does not format
     * domain-specific copy — callers translate and pass the string.
     */
    suffix?: string;
    /**
     * Optional content rendered before the kind icon. Used by
     * `UiLabelChecklistRow` to inject the row's checkbox.
     */
    leading?: ReactNode;
    /**
     * Optional id set on the inner label `<span>` so an interactive ancestor
     * can use it as `aria-labelledby` — e.g. `UiLabelChecklistRow` binds the
     * row checkbox's accessible name to this id instead of wrapping the row
     * in a `<label>` (which is invalid HTML around a `<div>`).
     */
    labelId?: string;
    /**
     * Optional row click handler. Used by `UiLabelChecklistRow` to delegate
     * clicks anywhere on the row to the inner checkbox without nesting the
     * row inside a `<label>`. Not fired when the click originates inside an
     * interactive descendant.
     */
    onClick?: () => void;
    /** Test id forwarded to the root element. */
    dataTestId?: string;
}

const ICON_BY_KIND = {
    primary: "ldmKey",
    default: "ldmLabel",
} as const;

/**
 * Read-only label row — icon + label + optional caller-supplied suffix. Used
 * inside the Labels list and (via `UiLabelChecklistRow`) the
 * Labels picker.
 *
 * @internal
 */
export function UiLabelRow({ label, kind, suffix, leading, labelId, onClick, dataTestId }: IUiLabelRowProps) {
    return (
        <div className={b()} data-testid={dataTestId} onClick={onClick}>
            {leading ? <span className={e("leading")}>{leading}</span> : null}
            <span className={e("icon")}>
                <UiIcon type={kind ? ICON_BY_KIND[kind] : "ldmLabel"} size={18} color="warning" />
            </span>
            <span className={e("label")} id={labelId}>
                {label}
            </span>
            {suffix ? <span className={e("suffix")}>{suffix}</span> : null}
        </div>
    );
}
