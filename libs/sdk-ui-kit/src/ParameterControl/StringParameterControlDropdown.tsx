// (C) 2026 GoodData Corporation

import { useState } from "react";

import { FormattedMessage, type MessageDescriptor, defineMessages } from "react-intl";

import { type IStringParameterConstraints, isValidStringParameterValue } from "@gooddata/sdk-model";

import { type IDropdownBodyRenderProps } from "../Dropdown/Dropdown.js";

import { ParameterControlDropdown } from "./ParameterControlDropdown.js";

const messages = defineMessages({
    errorTooShort: { id: "parameter_filter.dropdown.error.tooShort" },
    errorTooLong: { id: "parameter_filter.dropdown.error.tooLong" },
});

/**
 * @internal
 */
export interface IStringParameterControlDropdownProps {
    name: string;
    value: string;
    /**
     * Workspace-default snapshot used by the Reset link. Reset is hidden when this is
     * `undefined` or equals the current (valid) draft value. Reset writes this value into the
     * draft input only; the user must click Apply to commit.
     */
    resetValue?: string;
    constraints?: IStringParameterConstraints;
    inputId?: string;
    ariaAttributes?: IDropdownBodyRenderProps["ariaAttributes"];
    onApply: (value: string) => void;
    onCancel: () => void;
}

/**
 * Dropdown panel for editing a string parameter value as free text. Owns the draft, inline
 * length validation, preview, and (mode-aware) Reset via `resetValue`.
 *
 * @internal
 */
export function StringParameterControlDropdown({
    name,
    value,
    resetValue,
    constraints,
    inputId,
    ariaAttributes,
    onApply,
    onCancel,
}: IStringParameterControlDropdownProps) {
    const [draft, setDraft] = useState<string>(value);

    const error = getStringDraftValidationError(draft, constraints);
    const effectiveValue = error ? value : draft;
    const showReset = resetValue !== undefined && effectiveValue !== resetValue;

    return (
        <ParameterControlDropdown
            name={name}
            draft={draft}
            onDraftChange={setDraft}
            inputProps={{ type: "text" }}
            inputId={inputId}
            ariaAttributes={ariaAttributes}
            errorMessage={
                error ? (
                    <FormattedMessage
                        {...error}
                        values={{ minLength: constraints?.minLength, maxLength: constraints?.maxLength }}
                    />
                ) : undefined
            }
            previewValue={effectiveValue}
            onReset={showReset ? () => setDraft(resetValue) : undefined}
            onApply={() => onApply(draft)}
            onCancel={onCancel}
        />
    );
}

function getStringDraftValidationError(
    draft: string,
    constraints?: IStringParameterConstraints,
): MessageDescriptor | undefined {
    if (isValidStringParameterValue(draft, constraints)) {
        return undefined;
    }
    const { minLength } = constraints ?? {};
    return minLength !== undefined && draft.length < minLength
        ? messages.errorTooShort
        : messages.errorTooLong;
}
