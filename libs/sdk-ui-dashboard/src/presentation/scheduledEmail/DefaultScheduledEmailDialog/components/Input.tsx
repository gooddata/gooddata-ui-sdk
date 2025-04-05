// (C) 2019-2025 GoodData Corporation
import * as React from "react";
import { Input as InputSDK } from "@gooddata/sdk-ui-kit";
import { FormattedMessage } from "react-intl";

interface IInputOwnProps {
    id?: string;
    className?: string;
    label: string;
    maxlength?: number;
    placeholder: string;
    value?: string;
    autocomplete?: string;
    validationError?: string | null;
    accessibilityErrorId?: string;
    onChange: (value: string) => void;
    onBlur?: (value: string) => void;
}

export type IInputProps = IInputOwnProps;

export const Input: React.FC<IInputProps> = (props) => {
    const {
        id,
        className = "",
        label,
        maxlength,
        placeholder,
        value,
        autocomplete,
        validationError,
        accessibilityErrorId,
        onChange,
        onBlur,
    } = props;
    const classNames = `gd-input-component ${className}`;

    const handleOnBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        onBlur?.((e.target as HTMLInputElement).value);
    };

    return (
        <div className={classNames}>
            <label htmlFor={id} className="gd-label">
                {label}
            </label>
            <div className="gd-notifications-channels-dialog-subject-wrapper">
                <InputSDK
                    id={id}
                    hasError={!!validationError}
                    maxlength={maxlength}
                    placeholder={placeholder}
                    value={value}
                    onChange={
                        // as any, the value will indeed always be string
                        // TODO improve typings of Input in ui-kit to have properly typed the onChange related to the input type
                        onChange as any
                    }
                    autocomplete={autocomplete}
                    onBlur={handleOnBlur}
                    accessibilityConfig={{
                        ariaDescribedBy: validationError ? accessibilityErrorId : undefined,
                    }}
                />
                {validationError ? (
                    <span
                        id={accessibilityErrorId}
                        className="gd-notifications-channels-dialog-subject-error"
                    >
                        <FormattedMessage id={validationError} />
                    </span>
                ) : null}
            </div>
        </div>
    );
};
