// (C) 2020 GoodData Corporation
import * as React from "react";
import * as numberJS from "@gooddata/numberjs";
import { ISeparators } from "@gooddata/sdk-ui";

const { stripColors, numberFormat, colors2Object }: any = numberJS;

interface IFormattedPreviewProps {
    previewNumber: number;
    format: string;
    colors?: boolean;
    separators?: ISeparators;
    className?: string;
}

export const FormattedPreview: React.FC<IFormattedPreviewProps> = ({
    previewNumber,
    format,
    colors = true,
    separators,
    className,
}) => {
    if (!colors) {
        const label = numberFormat(previewNumber, stripColors(format), undefined, separators);
        return <span className={className}>{label}</span>;
    }

    const { label, color = "", backgroundColor = "" } = colors2Object(
        numberFormat(previewNumber, format, undefined, separators),
    );

    const style = { color, backgroundColor };

    return (
        <span className={className} style={style}>
            {label}
        </span>
    );
};
