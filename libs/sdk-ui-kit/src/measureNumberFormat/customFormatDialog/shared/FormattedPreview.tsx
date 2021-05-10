// (C) 2020 GoodData Corporation
import React from "react";
import cx from "classnames";
import numberJS from "@gooddata/numberjs";
import { ISeparators } from "@gooddata/sdk-ui";

const { stripColors, numberFormat, colors2Object }: any = numberJS;

export const Label: React.FC<{ value?: string; style?: React.CSSProperties; className?: string }> = ({
    value,
    style,
    className,
}) => (
    <div className={cx("gd-measure-format-preview-formatted", className)}>
        <span style={style}>{value}</span>
    </div>
);

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
    if (format === "") {
        return <Label />;
    }

    const preview = previewNumber !== null ? previewNumber : "";

    if (!colors) {
        const label = numberFormat(preview, stripColors(format), undefined, separators);
        return <Label value={label} className={customClassName} />;
    }

    const {
        label,
        color = "",
        backgroundColor = "",
    } = colors2Object(numberFormat(preview, format, undefined, separators));

    const style = { color, backgroundColor };

    return <Label value={label} className={customClassName} style={style} />;
};
