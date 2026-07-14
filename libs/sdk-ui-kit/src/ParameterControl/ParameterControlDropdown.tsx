// (C) 2026 GoodData Corporation

import { type ComponentPropsWithoutRef, type ReactNode } from "react";

import cx from "classnames";
import { FormattedMessage, defineMessages, useIntl } from "react-intl";

import { type ParameterValue } from "@gooddata/sdk-model";

import { bem } from "../@ui/@utils/bem.js";
import { UiButton } from "../@ui/UiButton/UiButton.js";
import { type IDropdownBodyRenderProps } from "../Dropdown/Dropdown.js";
import { useId } from "../utils/useId.js";

const { b, e } = bem("gd-ui-kit-parameter-control");

const messages = defineMessages({
    valueLabel: { id: "parameter_filter.dropdown.value_label" },
    reset: { id: "parameter_filter.dropdown.reset" },
    previewLabel: { id: "parameter_filter.dropdown.preview_label" },
    apply: { id: "parameter_filter.dropdown.apply" },
    cancel: { id: "cancel" },
});

/**
 * @internal
 */
export interface IParameterControlDropdownProps {
    name: string;
    draft: string;
    onDraftChange: (draft: string) => void;
    inputProps?: Pick<ComponentPropsWithoutRef<"input">, "type" | "min" | "max">;
    inputId?: string;
    ariaAttributes?: IDropdownBodyRenderProps["ariaAttributes"];
    errorMessage?: ReactNode;
    previewValue: ParameterValue;
    onReset?: () => void;
    onApply: () => void;
    onCancel: () => void;
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
    inputProps,
    inputId: inputIdProp,
    ariaAttributes,
    errorMessage,
    previewValue,
    onReset,
    onApply,
    onCancel,
}: IParameterControlDropdownProps) {
    const intl = useIntl();
    const generatedInputId = useId();
    const inputId = inputIdProp ?? generatedInputId;

    return (
        <div
            {...ariaAttributes}
            className={`${b({ dropdown: true })} overlay gd-dialog gd-dropdown`}
            data-testid="parameter-control-dropdown"
        >
            <div className={cx(e("dropdown-field"), { "has-error": !!errorMessage })}>
                <div className={e("dropdown-field-header")}>
                    <label htmlFor={inputId} className={e("dropdown-label")}>
                        {intl.formatMessage(messages.valueLabel)}
                    </label>
                    {onReset ? (
                        <button
                            type="button"
                            className={e("dropdown-reset")}
                            data-testid="parameter-control-dropdown-reset"
                            onClick={onReset}
                        >
                            {intl.formatMessage(messages.reset)}
                        </button>
                    ) : null}
                </div>
                <input
                    {...inputProps}
                    id={inputId}
                    className={`${e("dropdown-input")} gd-input-field`}
                    data-testid="parameter-control-dropdown-input"
                    value={draft}
                    onChange={(event) => onDraftChange(event.target.value)}
                />
                {errorMessage ? (
                    <div className={e("dropdown-error")} data-testid="parameter-control-dropdown-error">
                        {errorMessage}
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
                            value: previewValue,
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
                    onClick={onApply}
                    isDisabled={!!errorMessage}
                />
            </div>
        </div>
    );
}
