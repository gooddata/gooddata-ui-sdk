// (C) 2026 GoodData Corporation

import { type ReactNode, useId } from "react";

import { bem } from "../@utils/bem.js";
import { UiRadio } from "../UiRadio/UiRadio.js";

const { b, e } = bem("gd-ui-kit-radio-row");

/**
 * @internal
 */
export interface IUiRadioRowProps {
    /** Whether this row's radio is selected. */
    checked: boolean;
    /** Fires when the user picks this row. */
    onChange?: () => void;
    /**
     * `name` attribute shared by a group of mutually exclusive
     * radio rows.
     */
    name?: string;
    /** Value sent on the change — typically the row's option identifier. */
    value?: string;
    /** Primary label, bold complementary-8. */
    title: string;
    /** Optional descriptive subline, regular complementary-6. */
    description?: string;
    /** Optional trailing content rendered after the text (e.g. row controls). */
    trailing?: ReactNode;
    disabled?: boolean;
    /** Test id forwarded to the root element. */
    dataTestId?: string;
}

/**
 * Selectable row composed of a radio + title + optional description + optional
 * trailing slot. Mirror of `UiLabelChecklistRow` for the radio case.
 *
 * @internal
 */
export function UiRadioRow({
    checked,
    onChange,
    name,
    value,
    title,
    description,
    trailing,
    disabled,
    dataTestId,
}: IUiRadioRowProps) {
    const inputId = useId();
    const descriptionId = useId();
    return (
        <div className={b({ disabled: disabled ?? false })} data-testid={dataTestId}>
            <UiRadio
                id={inputId}
                checked={checked}
                onChange={onChange ? () => onChange() : undefined}
                name={name}
                value={value}
                disabled={disabled}
                accessibilityConfig={description ? { ariaDescribedBy: descriptionId } : undefined}
            />
            <span className={e("text")}>
                <label className={e("title")} htmlFor={inputId}>
                    {title}
                </label>
                {description ? (
                    <span id={descriptionId} className={e("description")}>
                        {description}
                    </span>
                ) : null}
            </span>
            {trailing ? <span className={e("trailing")}>{trailing}</span> : null}
        </div>
    );
}
