// (C) 2026 GoodData Corporation

import { type ChangeEvent, useId } from "react";

import { UiCheckbox } from "../UiCheckbox/UiCheckbox.js";
import { type LabelRowKind, UiLabelRow } from "../UiLabelRow/UiLabelRow.js";

/**
 * @internal
 */
export interface IUiLabelChecklistRowProps {
    /** Label text. */
    label: string;
    /** Determines the leading icon. Omit for a generic label icon. */
    kind?: LabelRowKind;
    /** Optional trailing suffix passed through to `UiLabelRow`. */
    suffix?: string;
    /** Whether the label is selected for inclusion. */
    checked: boolean;
    /**
     * When true the row is rendered but cannot be toggled. Use for the primary
     * key row, which is always included.
     */
    disabled?: boolean;
    /** Fires when the user toggles the checkbox. */
    onChange?: (checked: boolean) => void;
    /** Test id forwarded to the root element. */
    dataTestId?: string;
}

/**
 * Selectable label row used inside the Labels picker. The row delegates row
 * clicks to the inner checkbox and binds the checkbox's accessible name to
 * the row's label span via `aria-labelledby` — instead of wrapping the row
 * in a `<label>` element (which is invalid HTML around the row's `<div>`).
 * `disabled` locks the row for the primary-key case.
 *
 * @internal
 */
export function UiLabelChecklistRow({
    label,
    kind,
    suffix,
    checked,
    disabled = false,
    onChange,
    dataTestId,
}: IUiLabelChecklistRowProps) {
    const inputId = useId();
    const labelId = `${inputId}-label`;
    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        onChange?.(event.target.checked);
    };
    // Row click delegates to the checkbox toggle. The native input also
    // receives the click directly when the user clicks the checkbox itself —
    // `preventDefault` on the input stops the row handler from re-toggling.
    const handleRowClick = disabled ? undefined : () => onChange?.(!checked);

    return (
        <UiLabelRow
            label={label}
            kind={kind}
            suffix={suffix}
            dataTestId={dataTestId}
            labelId={labelId}
            onClick={handleRowClick}
            leading={
                <UiCheckbox
                    id={inputId}
                    checked={checked}
                    disabled={disabled}
                    onChange={handleChange}
                    preventDefault
                    accessibilityConfig={{ ariaLabelledBy: labelId }}
                />
            }
        />
    );
}
