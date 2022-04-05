// (C) 2019-2020 GoodData Corporation
import * as React from "react";
import { Input as InputSDK } from "@gooddata/sdk-ui-kit";

interface IInputOwnProps {
    className?: string;
    label: string;
    maxlength?: number;
    placeholder: string;
    value?: string;
    onChange: (value: string) => void;
}

export type IInputProps = IInputOwnProps;

export const Input: React.FC<IInputProps> = (props) => {
    const { className = "", label, maxlength, placeholder, value, onChange } = props;
    const classNames = `gd-input-component ${className}`;

    return (
        <div className={classNames}>
            <label className="gd-label">{label}</label>
            <InputSDK
                hasError={false}
                maxlength={maxlength}
                placeholder={placeholder}
                value={value}
                onChange={
                    // as any, the value will indeed always be string
                    // TODO improve typings of Input in ui-kit to have properly typed the onChange related to the input type
                    onChange as any
                }
            />
        </div>
    );
};
