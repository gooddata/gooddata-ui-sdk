// (C) 2021 GoodData Corporation

import React from "react";
import cx from "classnames";

export interface ISharedObjectCheckboxControlProps {
    isChecked: boolean;
    isSupported: boolean;
    onChange: (checked: boolean) => void;
    name: string;
    label: string;
    className?: string;
}

export const SharedObjectCheckboxControl: React.FC<ISharedObjectCheckboxControlProps> = ({
    isChecked,
    isSupported,
    onChange,
    name,
    label,
    className,
}) => {
    if (!isSupported) {
        return null;
    }

    const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.checked);
    const classNames = cx("input-checkbox-label", className);

    return (
        <label className={classNames}>
            <input
                type="checkbox"
                name={name}
                className="input-checkbox"
                checked={isChecked}
                onChange={handleOnChange}
            />
            <span className="input-label-text">{label}</span>
        </label>
    );
};
