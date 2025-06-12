// (C) 2025 GoodData Corporation

import React from "react";
import cx from "classnames";

export interface IInputDescriptionProps {
    descriptionId: string;
    errorText?: string;
}

export const InputErrorMessage: React.FC<IInputDescriptionProps> = ({ descriptionId, errorText }) => {
    if (!errorText) {
        return null;
    }
    return (
        <div
            id={descriptionId}
            className={cx("gd-date-range-picker-input__description", {
                "gd-date-range-picker-input__description--error": !!errorText,
                "s-absolute-range-error": !!errorText,
            })}
        >
            {errorText}
        </div>
    );
};
