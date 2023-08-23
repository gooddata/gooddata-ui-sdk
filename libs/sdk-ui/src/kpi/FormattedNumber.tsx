// (C) 2019 GoodData Corporation
import React from "react";
import { ISeparators } from "@gooddata/sdk-model";
import { ClientFormatterFacade } from "@gooddata/number-formatter";

/**
 * @internal
 */
export interface IFormattedNumberProps {
    className?: string;
    value: number | string;
    format?: string;
    separators?: ISeparators;
}

/**
 * @internal
 */
export const FormattedNumber: React.FC<IFormattedNumberProps> = ({
    className,
    value,
    format,
    separators,
}) => {
    const valueToFormat = ClientFormatterFacade.convertValue(value);

    const { formattedValue: label, colors } = ClientFormatterFacade.formatValue(
        valueToFormat,
        format,
        separators,
    );

    const { color, backgroundColor } = colors;

    return (
        <span className={className} style={{ color, backgroundColor }}>
            {label}
        </span>
    );
};
