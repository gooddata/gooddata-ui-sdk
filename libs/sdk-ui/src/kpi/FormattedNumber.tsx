import * as React from "react";
import { colors2Object, ISeparators, numberFormat } from "@gooddata/numberjs";

export interface IFormattedNumberProps {
    className: string;
    number: number | string;
    format?: string;
    separators?: ISeparators;
}

const DEFAULT_FORMAT = "#,#.##";

export const FormattedNumber: React.StatelessComponent<IFormattedNumberProps> = ({
    className,
    number,
    format = DEFAULT_FORMAT,
    separators,
}) => {
    const formattedNumber = numberFormat(number, format, undefined, separators);
    const { label, color, backgroundColor } = colors2Object(formattedNumber);
    return (
        <span className={className} style={{ color, backgroundColor }}>
            {label}
        </span>
    );
};
