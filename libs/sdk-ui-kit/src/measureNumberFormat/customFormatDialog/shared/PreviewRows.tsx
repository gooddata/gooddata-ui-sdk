// (C) 2020-2025 GoodData Corporation

import { ISeparators } from "@gooddata/sdk-ui";

import { FormattedPreview } from "./FormattedPreview.js";

interface IPreviewNumberRowProps {
    previewNumber: number;
    format: string;
    separators?: ISeparators;
}

function PreviewNumberRow({ previewNumber, format, separators }: IPreviewNumberRowProps) {
    return (
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
}

export interface IPreviewNumberRowsProps {
    previewNumbers?: number[];
    format: string;
    separators?: ISeparators;
}

function PreviewRows({
    previewNumbers = [0, 1.234, 1234.567, 1234567.891],
    format,
    separators,
}: IPreviewNumberRowsProps) {
    return (
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
}

export default PreviewRows;
