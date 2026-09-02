// (C) 2026 GoodData Corporation

import { useState } from "react";

import { FormattedMessage, type MessageDescriptor, defineMessages } from "react-intl";

import { type IStringParameterConstraints, isValidStringParameterValue } from "@gooddata/sdk-model";

import { type IDropdownBodyRenderProps } from "../Dropdown/Dropdown.js";

import { ParameterControlDropdown } from "./ParameterControlDropdown.js";
import { type ParameterSubmitModeProps } from "./submitMode.js";

const messages = defineMessages({
    errorTooShort: { id: "parameter_filter.dropdown.error.tooShort" },
    errorTooLong: { id: "parameter_filter.dropdown.error.tooLong" },
});

/**
 * @internal
 */
export type IStringParameterControlDropdownProps = {
    name: string;
    value: string;
    /**
     * The workspace default value for the Reset link. The control hides Reset when this value is
     * `undefined`, or when it is equal to the current valid draft.
     */
    resetValue?: string;
    constraints?: IStringParameterConstraints;
    inputId?: string;
    ariaAttributes?: IDropdownBodyRenderProps["ariaAttributes"];
    onClose: () => void;
} & ParameterSubmitModeProps<string>;

/**
 * Dropdown panel to edit a string parameter value as free text. It keeps the draft, does the
 * inline length validation, and shows the Reset link.
 *
 * @internal
 */
export function StringParameterControlDropdown(props: IStringParameterControlDropdownProps) {
    const { name, value, resetValue, constraints, inputId, ariaAttributes, onClose } = props;
    const [draft, setDraft] = useState<string>(value);

    const error = getStringDraftValidationError(draft, constraints);
    const effectiveValue = error ? value : draft;
    const showReset = resetValue !== undefined && effectiveValue !== resetValue;

    function updateDraft(next: string) {
        setDraft(next);
        if (props.mode === "staged" && !getStringDraftValidationError(next, constraints)) {
            props.onStage(next);
        }
    }

    return (
        <ParameterControlDropdown
            name={name}
            draft={draft}
            onDraftChange={updateDraft}
            inputType="text"
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
            onReset={showReset ? () => updateDraft(resetValue) : undefined}
            onApply={props.mode === "commit" ? () => props.onCommit(draft) : undefined}
            onClose={onClose}
        />
    );
}

function getStringDraftValidationError(
    draft: string,
    constraints?: IStringParameterConstraints,
): MessageDescriptor | undefined {
    const { minLength, maxLength } = constraints ?? {};
    if (isValidStringParameterValue(draft, { minLength, maxLength })) {
        return undefined;
    }
    return minLength !== undefined && draft.length < minLength
        ? messages.errorTooShort
        : messages.errorTooLong;
}
