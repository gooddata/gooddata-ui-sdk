// (C) 2026 GoodData Corporation

import { useState } from "react";

import { FormattedMessage, type MessageDescriptor, defineMessages } from "react-intl";

import { type INumberParameterConstraints, isValidNumberParameterValue } from "@gooddata/sdk-model";

import { type IDropdownBodyRenderProps } from "../Dropdown/Dropdown.js";

import { ParameterControlDropdown } from "./ParameterControlDropdown.js";

const messages = defineMessages({
    errorNotANumber: { id: "parameter_filter.dropdown.error.notANumber" },
    errorOutOfRange: { id: "parameter_filter.dropdown.error.outOfRange" },
    errorOutOfRangeMin: { id: "parameter_filter.dropdown.error.outOfRange.min" },
    errorOutOfRangeMax: { id: "parameter_filter.dropdown.error.outOfRange.max" },
});

/**
 * @internal
 */
export interface INumberParameterControlDropdownProps {
    name: string;
    value: number;
    /**
     * Workspace-default snapshot used by the Reset link. Reset is hidden when this is
     * `undefined` or equals the current (valid) draft value. Reset writes this value into the
     * draft input only; the user must click Apply to commit.
     */
    resetValue?: number;
    constraints?: INumberParameterConstraints;
    inputId?: string;
    ariaAttributes?: IDropdownBodyRenderProps["ariaAttributes"];
    onApply: (value: number) => void;
    onCancel: () => void;
}

/**
 * Dropdown panel for editing a numeric parameter value. Owns the draft, inline validation,
 * preview, and (mode-aware) Reset via `resetValue`.
 *
 * @internal
 */
export function NumberParameterControlDropdown({
    name,
    value,
    resetValue,
    constraints,
    inputId,
    ariaAttributes,
    onApply,
    onCancel,
}: INumberParameterControlDropdownProps) {
    const [draft, setDraft] = useState<string>(String(value));

    const error = getDraftValidationError(draft, constraints);
    const effectiveValue = error ? value : parseDraft(draft);
    const showReset = resetValue !== undefined && effectiveValue !== resetValue;

    return (
        <ParameterControlDropdown
            name={name}
            draft={draft}
            onDraftChange={setDraft}
            inputProps={{ type: "number", min: constraints?.min, max: constraints?.max }}
            inputId={inputId}
            ariaAttributes={ariaAttributes}
            errorMessage={
                error ? (
                    <FormattedMessage {...error} values={{ min: constraints?.min, max: constraints?.max }} />
                ) : undefined
            }
            previewValue={effectiveValue}
            onReset={showReset ? () => setDraft(String(resetValue)) : undefined}
            onApply={() => onApply(parseDraft(draft))}
            onCancel={onCancel}
        />
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
