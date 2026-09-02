// (C) 2026 GoodData Corporation

import { type ReactNode } from "react";

import { FormattedMessage, defineMessages, useIntl } from "react-intl";

import { type ParameterValue } from "@gooddata/sdk-model";

import { bem } from "../@ui/@utils/bem.js";
import { UiButton } from "../@ui/UiButton/UiButton.js";
import { type IDropdownBodyRenderProps } from "../Dropdown/Dropdown.js";
import { useId } from "../utils/useId.js";

import { ParameterInput } from "./ParameterInput.js";

const { b, e } = bem("gd-ui-kit-parameter-control");

const messages = defineMessages({
    valueLabel: { id: "parameter_filter.dropdown.value_label" },
    reset: { id: "parameter_filter.dropdown.reset" },
    previewLabel: { id: "parameter_filter.dropdown.preview_label" },
    apply: { id: "parameter_filter.dropdown.apply" },
    cancel: { id: "cancel" },
    close: { id: "close" },
    increment: { id: "parameter_filter.input.increment" },
    decrement: { id: "parameter_filter.input.decrement" },
});

/**
 * @internal
 */
export interface IParameterControlDropdownProps {
    name: string;
    draft: string;
    onDraftChange: (draft: string) => void;
    inputType: "text" | "number";
    min?: number;
    max?: number;
    inputId?: string;
    ariaAttributes?: IDropdownBodyRenderProps["ariaAttributes"];
    errorMessage?: ReactNode;
    previewValue?: ParameterValue;
    onReset?: () => void;
    /**
     * Commits the draft. Without this callback, the footer shows only Close.
     */
    onApply?: () => void;
    onClose: () => void;
}

/**
 * Presentational dropdown shared by the parameter control variants; variants own the draft state,
 * parsing, and validation.
 *
 * @internal
 */
export function ParameterControlDropdown({
    name,
    draft,
    onDraftChange,
    inputType,
    min,
    max,
    inputId: inputIdProp,
    ariaAttributes,
    errorMessage,
    previewValue,
    onReset,
    onApply,
    onClose,
}: IParameterControlDropdownProps) {
    const intl = useIntl();
    const generatedInputId = useId();
    const inputId = inputIdProp ?? generatedInputId;
    const errorMessageId = errorMessage ? `${inputId}-error` : undefined;

    return (
        <div
            {...ariaAttributes}
            className={`${b({ dropdown: true })} overlay gd-dialog gd-dropdown`}
            data-testid="parameter-control-dropdown"
        >
            <div className={e("dropdown-field")}>
                <div className={e("dropdown-field-header")}>
                    <label htmlFor={inputId} className={e("dropdown-label")}>
                        {intl.formatMessage(messages.valueLabel)}
                    </label>
                    {onReset ? (
                        <UiButton
                            type="button"
                            variant="linkDimmed"
                            size="small"
                            label={intl.formatMessage(messages.reset)}
                            dataTestId="parameter-control-dropdown-reset"
                            onClick={onReset}
                        />
                    ) : null}
                </div>
                <ParameterInput
                    type={inputType}
                    min={min}
                    max={max}
                    id={inputId}
                    value={draft}
                    hasError={!!errorMessage}
                    errorMessageId={errorMessageId}
                    onChange={onDraftChange}
                    dataTestId="parameter-control-dropdown-input"
                    incrementAriaLabel={intl.formatMessage(messages.increment)}
                    decrementAriaLabel={intl.formatMessage(messages.decrement)}
                />
                {errorMessage ? (
                    <div
                        id={errorMessageId}
                        className={e("dropdown-error")}
                        data-testid="parameter-control-dropdown-error"
                    >
                        {errorMessage}
                    </div>
                ) : null}
            </div>
            {previewValue === undefined ? null : (
                <>
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
                                    value: previewValue,
                                    strong: (chunks) => <strong>{chunks}</strong>,
                                }}
                            />
                        </span>
                    </div>
                </>
            )}
            <div className={e("dropdown-footer")}>
                {onApply ? (
                    <>
                        <UiButton
                            type="button"
                            variant="secondary"
                            size="small"
                            label={intl.formatMessage(messages.cancel)}
                            dataTestId="parameter-control-dropdown-cancel"
                            onClick={onClose}
                        />
                        <UiButton
                            type="button"
                            variant="primary"
                            size="small"
                            label={intl.formatMessage(messages.apply)}
                            dataTestId="parameter-control-dropdown-apply"
                            onClick={onApply}
                            isDisabled={!!errorMessage}
                        />
                    </>
                ) : (
                    <UiButton
                        type="button"
                        variant="secondary"
                        size="small"
                        label={intl.formatMessage(messages.close)}
                        dataTestId="parameter-control-dropdown-close"
                        onClick={onClose}
                    />
                )}
            </div>
        </div>
    );
}
