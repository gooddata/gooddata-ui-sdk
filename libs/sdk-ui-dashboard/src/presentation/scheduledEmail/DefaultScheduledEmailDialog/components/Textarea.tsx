// (C) 2019-2025 GoodData Corporation

import * as React from "react";
import { forwardRef, memo, useCallback } from "react";

import cx from "classnames";

import { IAccessibilityConfigBase } from "@gooddata/sdk-ui-kit";

interface ITextareaOwnProps {
    hasError?: boolean;
    hasWarning?: boolean;
    errorId?: string;
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
    accessibilityConfig?: IAccessibilityConfigBase;
}

export type ITextareaProps = ITextareaOwnProps;

export const Textarea = memo(
    forwardRef<HTMLTextAreaElement, ITextareaProps>(function Textarea(
        {
            hasError = false,
            hasWarning = false,
            maxlength,
            id,
            placeholder,
            value,
            rows,
            onChange,
            onFocus,
            onBlur,
            validationError,
            autocomplete,
            accessibilityConfig,
        },
        ref,
    ) {
        const getTextareaClassNames = useCallback(() => {
            return cx("gd-input-field", {
                "has-error": hasError,
                "has-warning": hasWarning,
            });
        }, [hasError, hasWarning]);

        const handleChange = useCallback(
            (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
                onChange(e.target.value);
            },
            [onChange],
        );

        const handleBlur = useCallback(
            (e: React.FocusEvent<HTMLTextAreaElement>) => {
                onBlur?.(e.target.value);
            },
            [onBlur],
        );

        return (
            <textarea
                ref={ref}
                id={id}
                className={getTextareaClassNames()}
                maxLength={maxlength}
                placeholder={placeholder}
                value={value}
                rows={rows}
                onChange={handleChange}
                onFocus={onFocus}
                autoComplete={autocomplete}
                onBlur={handleBlur}
                aria-describedby={validationError ? accessibilityConfig?.ariaDescribedBy : undefined}
                aria-labelledby={accessibilityConfig?.ariaLabelledBy}
            />
        );
    }),
);
