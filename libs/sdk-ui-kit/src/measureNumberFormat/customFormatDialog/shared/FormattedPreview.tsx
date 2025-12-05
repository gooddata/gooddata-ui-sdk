// (C) 2020-2025 GoodData Corporation

import { CSSProperties } from "react";

import cx from "classnames";

import { ClientFormatterFacade, IFormattedResult, ISeparators } from "@gooddata/number-formatter";

export function Label({
    value,
    style,
    className,
}: {
    value?: string;
    style?: CSSProperties;
    className?: string;
}) {
    return (
        <div className={cx("gd-measure-format-preview-formatted", className)}>
            <span style={style}>{value}</span>
        </div>
    );
}

export interface IFormattedPreviewProps {
    previewNumber: number | null;
    format: string;
    colors?: boolean;
    separators?: ISeparators;
    className?: string;
}

function getFormattedNumber(
    value: number | null,
    format: string,
    separators: ISeparators | undefined,
): IFormattedResult {
    return ClientFormatterFacade.formatValue(value, format, separators);
}

export function FormattedPreview({
    previewNumber,
    format,
    colors = true,
    separators,
    className: customClassName,
}: IFormattedPreviewProps) {
    if (format === "") {
        return <Label />;
    }

    const style = { color: "", backgroundColor: "" };

    const { formattedValue, colors: formattedColors } = getFormattedNumber(previewNumber, format, separators);

    if (colors) {
        style.color = formattedColors.color ?? "";
        style.backgroundColor = formattedColors.backgroundColor ?? "";
    }

    return <Label value={formattedValue} className={customClassName} style={style} />;
}
