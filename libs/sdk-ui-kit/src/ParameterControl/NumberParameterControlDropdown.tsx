// (C) 2026 GoodData Corporation

import { useState } from "react";

import { FormattedMessage, type MessageDescriptor, defineMessages } from "react-intl";

import { type INumberParameterConstraints, isValidNumberParameterValue } from "@gooddata/sdk-model";

import { type IDropdownBodyRenderProps } from "../Dropdown/Dropdown.js";

import { ParameterControlDropdown } from "./ParameterControlDropdown.js";
import { type ParameterSubmitModeProps } from "./submitMode.js";

const messages = defineMessages({
    errorNotANumber: { id: "parameter_filter.dropdown.error.notANumber" },
    errorOutOfRange: { id: "parameter_filter.dropdown.error.outOfRange" },
    errorOutOfRangeMin: { id: "parameter_filter.dropdown.error.outOfRange.min" },
    errorOutOfRangeMax: { id: "parameter_filter.dropdown.error.outOfRange.max" },
});

/**
 * @internal
 */
export type INumberParameterControlDropdownProps = {
    name: string;
    value: number;
    /**
     * The workspace default value for the Reset link. The control hides Reset when this value is
     * `undefined`, or when it is equal to the current valid draft.
     */
    resetValue?: number;
    constraints?: INumberParameterConstraints;
    inputId?: string;
    ariaAttributes?: IDropdownBodyRenderProps["ariaAttributes"];
    onClose: () => void;
} & ParameterSubmitModeProps<number>;

/**
 * Dropdown panel to edit a numeric parameter value. It keeps the draft, does the inline
 * validation, and shows the Reset link.
 *
 * @internal
 */
export function NumberParameterControlDropdown(props: INumberParameterControlDropdownProps) {
    const { name, value, resetValue, constraints, inputId, ariaAttributes, onClose } = props;
    const [draft, setDraft] = useState<string>(String(value));

    const error = getDraftValidationError(draft, constraints);
    const effectiveValue = error ? value : parseDraft(draft);
    const showReset = resetValue !== undefined && effectiveValue !== resetValue;

    function updateDraft(next: string) {
        setDraft(next);
        if (props.mode === "staged" && !getDraftValidationError(next, constraints)) {
            props.onStage(parseDraft(next));
        }
    }

    return (
        <ParameterControlDropdown
            name={name}
            draft={draft}
            onDraftChange={updateDraft}
            inputType="number"
            min={constraints?.min}
            max={constraints?.max}
            inputId={inputId}
            ariaAttributes={ariaAttributes}
            errorMessage={
                error ? (
                    <FormattedMessage {...error} values={{ min: constraints?.min, max: constraints?.max }} />
                ) : undefined
            }
            onReset={showReset ? () => updateDraft(String(resetValue)) : undefined}
            onApply={props.mode === "commit" ? () => props.onCommit(parseDraft(draft)) : undefined}
            onClose={onClose}
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
