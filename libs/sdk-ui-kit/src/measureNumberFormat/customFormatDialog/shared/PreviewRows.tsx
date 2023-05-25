// (C) 2020 GoodData Corporation
import React from "react";
import { ISeparators } from "@gooddata/sdk-ui";

import { FormattedPreview } from "./FormattedPreview.js";

interface IPreviewNumberRowProps {
    previewNumber: number;
    format: string;
    separators?: ISeparators;
}

const PreviewNumberRow: React.FC<IPreviewNumberRowProps> = ({ previewNumber, format, separators }) => (
    <div className="gd-measure-format-extended-preview-row">
        <div className="gd-measure-format-extended-preview-number">
            <span>{previewNumber}</span>
        </div>
        <FormattedPreview
            previewNumber={previewNumber}
            format={format}
            separators={separators}
            className="s-number-format-preview-formatted gd-measure-format-extended-preview-formatted"
        />
    </div>
);

export interface IPreviewNumberRowsProps {
    previewNumbers?: number[];
    format: string;
    separators?: ISeparators;
}

const PreviewRows: React.FC<IPreviewNumberRowsProps> = ({
    previewNumbers = [0, 1.234, 1234.567, 1234567.891],
    format,
    separators,
}) => (
    <>
        {previewNumbers.map((previewNumber) => (
            <PreviewNumberRow
                previewNumber={previewNumber}
                separators={separators}
                key={previewNumber}
                format={format}
            />
        ))}
    </>
);

export default PreviewRows;
