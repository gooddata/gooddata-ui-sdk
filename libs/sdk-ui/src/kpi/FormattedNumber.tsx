// (C) 2019 GoodData Corporation
import React from "react";
import NumberJs from "@gooddata/numberjs";

/**
 * @internal
 */
export interface IFormattedNumberProps {
    className?: string;
    value: number | string;
    format?: string;
    separators?: NumberJs.ISeparators;
}

const DEFAULT_FORMAT = "#,#.##";

/**
 * @internal
 */
export const FormattedNumber: React.FC<IFormattedNumberProps> = ({
    className,
    value,
    format = DEFAULT_FORMAT,
    separators,
}) => {
    const formattedNumber = NumberJs.numberFormat(value, format, undefined, separators);
    const { label, color, backgroundColor } = NumberJs.colors2Object(formattedNumber);
    return (
        <span className={className} style={{ color, backgroundColor }}>
            {label}
        </span>
    );
};
