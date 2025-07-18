// (C) 2019-2025 GoodData Corporation
import { PureComponent, FocusEvent, ChangeEvent } from "react";
import cx from "classnames";
import { IAccessibilityConfigBase } from "@gooddata/sdk-ui-kit";

interface ITextareaOwnProps {
    hasError: boolean;
    hasWarning: boolean;
    errorId?: string;
    maxlength?: number;
    id?: string;
    placeholder: string;
    value: string;
    rows: number;
    onChange: (value: string) => void;
    onFocus?: (e: FocusEvent<HTMLTextAreaElement>) => void;
    onBlur?: (value: string) => void;
    validationError: string | null;
    autocomplete?: string;
    accessibilityConfig?: IAccessibilityConfigBase;
}

interface ITextareaState {
    rows: number;
}

export type ITextareaProps = ITextareaOwnProps;

export class Textarea extends PureComponent<ITextareaProps, ITextareaState> {
    public static defaultProps = {
        hasError: false,
        hasWarning: false,
    };

    constructor(props: ITextareaProps) {
        super(props);
    }

    public render() {
        const {
            id,
            maxlength,
            placeholder,
            accessibilityConfig,
            value,
            rows,
            autocomplete,
            validationError,
            onFocus,
        } = this.props;

        return (
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
                aria-describedby={validationError ? accessibilityConfig?.ariaDescribedBy : undefined}
                aria-labelledby={accessibilityConfig?.ariaLabelledBy}
            />
        );
    }

    private getTextareaClassNames = (): string => {
        const { hasError, hasWarning } = this.props;
        return cx("gd-input-field", {
            "has-error": hasError,
            "has-warning": hasWarning,
        });
    };

    private onChange = (e: ChangeEvent<HTMLTextAreaElement>): void => {
        this.props.onChange(e.target.value);
    };

    private onBlur = (e: FocusEvent<HTMLTextAreaElement>): void => {
        this.props.onBlur?.(e.target.value);
    };
}
