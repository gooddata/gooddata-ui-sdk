// (C) 2019-2025 GoodData Corporation
import * as React from "react";
import cx from "classnames";
import { FormattedMessage } from "react-intl";

const TEXTAREA_ERROR_ID = "textarea-error-id";

interface ITextareaOwnProps {
    className: string;
    hasError: boolean;
    hasWarning: boolean;
    label: string;
    maxlength?: number;
    id?: string;
    placeholder: string;
    value: string;
    rows: number;
    onChange: (value: string) => void;
    onFocus?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
    onBlur?: (value: string) => void;
    validationError: string | null;
    autocomplete?: string;
}

interface ITextareaState {
    rows: number;
}

export type ITextareaProps = ITextareaOwnProps;

export class Textarea extends React.PureComponent<ITextareaProps, ITextareaState> {
    public static defaultProps = {
        className: "",
        hasError: false,
        hasWarning: false,
    };

    constructor(props: ITextareaProps) {
        super(props);
    }

    public render() {
        const {
            id,
            className,
            label,
            maxlength,
            placeholder,
            value,
            rows,
            autocomplete,
            validationError,
            onFocus,
        } = this.props;
        const classNames = cx(`gd-input-component gd-textarea-component ${className}`);

        return (
            <div className={classNames}>
                <label htmlFor={id} className="gd-label">
                    {label}
                </label>
                <div className="gd-notifications-channels-dialog-message-content">
                    <label className="gd-input">
                        <textarea
                            id={id}
                            className={this.getTextareaClassNames()}
                            maxLength={maxlength}
                            placeholder={placeholder}
                            value={value}
                            rows={rows}
                            onChange={this.onChange}
                            autoComplete={autocomplete}
                            onFocus={onFocus}
                            onBlur={this.onBlur}
                            aria-describedby={validationError ? TEXTAREA_ERROR_ID : undefined}
                        />
                    </label>
                    {validationError ? (
                        <span
                            id={TEXTAREA_ERROR_ID}
                            className="gd-notifications-channels-dialog-message-error"
                        >
                            <FormattedMessage id={validationError} />
                        </span>
                    ) : null}
                </div>
            </div>
        );
    }

    private getTextareaClassNames = (): string => {
        const { hasError, hasWarning } = this.props;
        return cx("gd-input-field", {
            "has-error": hasError,
            "has-warning": hasWarning,
        });
    };

    private onChange = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
        this.props.onChange(e.target.value);
    };
    private onBlur = (e: React.FocusEvent<HTMLTextAreaElement>): void => {
        this.props.onBlur?.(e.target.value);
    };
}
