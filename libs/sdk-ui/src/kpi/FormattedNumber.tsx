// (C) 2019-2025 GoodData Corporation

import { ClientFormatterFacade } from "@gooddata/number-formatter";
import { ISeparators } from "@gooddata/sdk-model";

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
export function FormattedNumber({ className, value, format, separators }: IFormattedNumberProps) {
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
}
