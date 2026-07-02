// (C) 2026 GoodData Corporation

import { useState } from "react";

import cx from "classnames";
import { FormattedMessage, type MessageDescriptor, defineMessages, useIntl } from "react-intl";

import { type INumberParameterConstraints, isValidNumberParameterValue } from "@gooddata/sdk-model";

import { bem } from "../@ui/@utils/bem.js";
import { UiButton } from "../@ui/UiButton/UiButton.js";
import { useId } from "../utils/useId.js";

const { b, e } = bem("gd-ui-kit-parameter-control");

const messages = defineMessages({
    valueLabel: { id: "parameter_filter.dropdown.value_label" },
    reset: { id: "parameter_filter.dropdown.reset" },
    previewLabel: { id: "parameter_filter.dropdown.preview_label" },
    apply: { id: "parameter_filter.dropdown.apply" },
    cancel: { id: "cancel" },
    errorNotANumber: { id: "parameter_filter.dropdown.error.notANumber" },
    errorOutOfRange: { id: "parameter_filter.dropdown.error.outOfRange" },
    errorOutOfRangeMin: { id: "parameter_filter.dropdown.error.outOfRange.min" },
    errorOutOfRangeMax: { id: "parameter_filter.dropdown.error.outOfRange.max" },
});

/**
 * @internal
 */
export interface IParameterControlDropdownProps {
    name: string;
    value: number;
    /**
     * Workspace-default snapshot used by the Reset link. Reset is hidden when this is
     * `undefined` or equals `value`. Reset writes this value into the draft input only;
     * the user must click Apply to commit.
     */
    resetValue?: number;
    constraints?: INumberParameterConstraints;
    onApply: (value: number) => void;
    onCancel: () => void;
}

/**
 * Dropdown panel for editing a numeric parameter value. Owns the draft, inline validation,
 * preview, and (mode-aware) Reset via `resetValue`.
 *
 * Reset is visible only when `resetValue` is set and differs from `value`; clicking it
 * writes `resetValue` into the draft input only. The user must click Apply to commit.
 *
 * @internal
 */
export function ParameterControlDropdown({
    name,
    value,
    resetValue,
    constraints,
    onApply,
    onCancel,
}: IParameterControlDropdownProps) {
    const intl = useIntl();
    const inputId = useId();
    const [draft, setDraft] = useState<string>(String(value));

    const error = getDraftValidationError(draft, constraints);
    const effectiveValue = error ? value : parseDraft(draft);

    const handleApply = () => {
        if (error) {
            return;
        }
        onApply(parseDraft(draft));
    };

    const showReset = resetValue !== undefined && effectiveValue !== resetValue;

    return (
        <div
            className={`${b({ dropdown: true })} overlay gd-dialog gd-dropdown`}
            data-testid="parameter-control-dropdown"
        >
            <div className={cx(e("dropdown-field"), { "has-error": !!error })}>
                <div className={e("dropdown-field-header")}>
                    <label htmlFor={inputId} className={e("dropdown-label")}>
                        {intl.formatMessage(messages.valueLabel)}
                    </label>
                    {showReset ? (
                        <button
                            type="button"
                            className={e("dropdown-reset")}
                            data-testid="parameter-control-dropdown-reset"
                            onClick={() => setDraft(String(resetValue))}
                        >
                            {intl.formatMessage(messages.reset)}
                        </button>
                    ) : null}
                </div>
                <input
                    id={inputId}
                    type="number"
                    className={`${e("dropdown-input")} gd-input-field`}
                    data-testid="parameter-control-dropdown-input"
                    value={draft}
                    min={constraints?.min}
                    max={constraints?.max}
                    onChange={(event) => setDraft(event.target.value)}
                />
                {error ? (
                    <div className={e("dropdown-error")} data-testid="parameter-control-dropdown-error">
                        <FormattedMessage
                            {...error}
                            values={{ min: constraints?.min, max: constraints?.max }}
                        />
                    </div>
                ) : null}
            </div>
            <div className={e("dropdown-divider")} />
            <div className={e("dropdown-preview")} data-testid="parameter-control-dropdown-preview">
                <span className={e("dropdown-preview-label")}>
                    {intl.formatMessage(messages.previewLabel)}
                </span>
                <span className={e("dropdown-preview-text")}>
                    <FormattedMessage
                        id="parameter_filter.dropdown.preview"
                        values={{
                            name,
                            value: effectiveValue,
                            strong: (chunks) => <strong>{chunks}</strong>,
                        }}
                    />
                </span>
            </div>
            <div className={e("dropdown-footer")}>
                <UiButton
                    variant="secondary"
                    size="small"
                    label={intl.formatMessage(messages.cancel)}
                    dataTestId="parameter-control-dropdown-cancel"
                    onClick={onCancel}
                />
                <UiButton
                    variant="primary"
                    size="small"
                    label={intl.formatMessage(messages.apply)}
                    dataTestId="parameter-control-dropdown-apply"
                    onClick={handleApply}
                    isDisabled={!!error}
                />
            </div>
        </div>
    );
}

/**
 * Returns the message to show for an invalid draft, or `undefined` when the draft is a valid
 * in-range number. The single source of truth the dropdown derives its error row, input style,
 * and Apply-disabled state from.
 *
 * @internal
 */
export function getDraftValidationError(
    draft: string,
    constraints?: INumberParameterConstraints,
): MessageDescriptor | undefined {
    const value = parseDraft(draft);
    if (!Number.isFinite(value)) {
        return messages.errorNotANumber;
    }
    if (isValidNumberParameterValue(value, constraints)) {
        return undefined;
    }
    const { min, max } = constraints ?? {};
    if (min !== undefined && max === undefined) {
        return messages.errorOutOfRangeMin;
    }
    if (max !== undefined && min === undefined) {
        return messages.errorOutOfRangeMax;
    }
    return messages.errorOutOfRange;
}

function parseDraft(draft: string): number {
    return draft.trim() === "" ? Number.NaN : Number(draft);
}
