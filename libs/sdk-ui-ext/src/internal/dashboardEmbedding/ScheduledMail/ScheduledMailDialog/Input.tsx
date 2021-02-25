// (C) 2019-2020 GoodData Corporation
import * as React from "react";
import { Input as InputSDK } from "@gooddata/sdk-ui-kit";

interface IInputOwnProps {
    className?: string;
    label: string;
    maxlength?: number;
    placeholder: string;
    onChange: (value: string) => void;
}

export type IInputProps = IInputOwnProps;

export const Input: React.FC<IInputProps> = (props) => {
    const { className = "", label, maxlength, placeholder, onChange } = props;
    const classNames = `gd-input-component ${className}`;

    return (
        <div className={classNames}>
            <label className="gd-label">{label}</label>
            <InputSDK hasError={false} maxlength={maxlength} placeholder={placeholder} onChange={onChange} />
        </div>
    );
};
