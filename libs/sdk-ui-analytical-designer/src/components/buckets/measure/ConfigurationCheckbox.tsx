// (C) 2007-2026 GoodData Corporation

import { memo } from "react";

import classNames from "classnames";

interface IConfigurationCheckboxProps {
    checked?: boolean;
    disabled?: boolean;
    label: string;
    name: string;
    onChange: (checked: boolean) => void;
}

export const ConfigurationCheckbox = memo(function ConfigurationCheckbox({
    checked = false,
    disabled = false,
    label,
    name,
    onChange,
}: IConfigurationCheckboxProps) {
    return (
        <label className={classNames("input-checkbox-label", { "is-disabled": disabled })}>
            <input
                type="checkbox"
                name={name}
                className={`input-checkbox s-${name}`}
                checked={checked}
                disabled={disabled}
                onChange={(e) => onChange(e.target.checked)}
            />
            <span title={label} className="input-label-text">
                {label}
            </span>
        </label>
    );
});
