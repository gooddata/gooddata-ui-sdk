// (C) 2020 GoodData Corporation
import * as React from "react";
import classNames from "classnames";
import * as numberJS from "@gooddata/numberjs";
import { ISeparators } from "@gooddata/sdk-ui";

const { stripColors, numberFormat, colors2Object }: any = numberJS;

export interface IFormattedPreviewProps {
    previewNumber: number | null;
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
    className: customClassName,
}) => {
    const className = classNames("gd-measure-format-preview-formatted", customClassName);

    if (format === "") {
        return <span className={className} />;
    }

    const preview = previewNumber !== null ? previewNumber : "";

    if (!colors) {
        const label = numberFormat(preview, stripColors(format), undefined, separators);
        return <span className={className}>{label}</span>;
    }

    const { label, color = "", backgroundColor = "" } = colors2Object(
        numberFormat(preview, format, undefined, separators),
    );

    const style = { color, backgroundColor };

    return (
        <span className={className} style={style}>
            {label}
        </span>
    );
};
