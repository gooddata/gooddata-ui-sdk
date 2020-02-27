// (C) 2019 GoodData Corporation
import React from "react";
import { colors2Object, ISeparators, numberFormat } from "@gooddata/numberjs";

/**
 * @internal
 */
export interface IFormattedNumberProps {
    className?: string;
    value: number | string;
    format?: string;
    separators?: ISeparators;
}

const DEFAULT_FORMAT = "#,#.##";

/**
 * @internal
 */
export const FormattedNumber: React.StatelessComponent<IFormattedNumberProps> = ({
    className,
    value,
    format = DEFAULT_FORMAT,
    separators,
}) => {
    const formattedNumber = numberFormat(value, format, undefined, separators);
    const { label, color, backgroundColor } = colors2Object(formattedNumber);
    return (
        <span className={className} style={{ color, backgroundColor }}>
            {label}
        </span>
    );
};
