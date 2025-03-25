// (C) 2019-2025 GoodData Corporation
import * as React from "react";
import { Input as InputSDK } from "@gooddata/sdk-ui-kit";

interface IInputOwnProps {
    id?: string;
    className?: string;
    label: string;
    maxlength?: number;
    placeholder: string;
    value?: string;
    autocomplete?: string;
    onChange: (value: string) => void;
}

export type IInputProps = IInputOwnProps;

export const Input: React.FC<IInputProps> = (props) => {
    const { id, className = "", label, maxlength, placeholder, value, onChange, autocomplete } = props;
    const classNames = `gd-input-component ${className}`;

    return (
        <div className={classNames}>
            <label htmlFor={id} className="gd-label">
                {label}
            </label>
            <InputSDK
                id={id}
                hasError={false}
                maxlength={maxlength}
                placeholder={placeholder}
                value={value}
                onChange={
                    // as any, the value will indeed always be string
                    // TODO improve typings of Input in ui-kit to have properly typed the onChange related to the input type
                    onChange as any
                }
                autocomplete={autocomplete}
            />
        </div>
    );
};
