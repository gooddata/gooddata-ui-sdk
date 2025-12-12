// (C) 2020-2025 GoodData Corporation

import { memo, useCallback, useState } from "react";

import { useIntl } from "react-intl";

import { type ISeparators } from "@gooddata/sdk-ui";

import { ExtendedPreview } from "./ExtendedPreview.js";
import { InputWithNumberFormat } from "../../../Form/index.js";
import { FormattedPreview } from "../shared/FormattedPreview.js";

const DEFAULT_PREVIEW_VALUE = -1234.5678;

interface ICustomFormatPreviewProps {
    format: string;
    separators?: ISeparators;
}

export const Preview = memo(function Preview(props: ICustomFormatPreviewProps) {
    const [preview, setPreview] = useState<number>(DEFAULT_PREVIEW_VALUE);
    const intl = useIntl();

    const { format, separators } = props;

    const onPreviewChange = useCallback((value: string | number): void => {
        setPreview(typeof value === "number" ? value : parseFloat(value) || 0);
    }, []);

    return (
        <div
            className={
                "gd-measure-custom-format-dialog-section gd-measure-custom-format-dialog-section-preview"
            }
        >
            <span className={"gd-measure-custom-format-dialog-section-title"}>
                {intl.formatMessage({ id: "measureNumberCustomFormatDialog.preview" })}
            </span>
            <div className={"gd-measure-custom-format-dialog-preview"}>
                <InputWithNumberFormat
                    className="s-custom-format-dialog-preview-input gd-measure-custom-format-dialog-preview-input"
                    value={preview}
                    isSmall
                    autofocus={false}
                    onChange={onPreviewChange}
                    separators={separators}
                />
                <FormattedPreview
                    previewNumber={preview}
                    format={format}
                    separators={separators}
                    className="s-custom-format-dialog-preview-formatted gd-measure-custom-format-dialog-preview-string"
                />
            </div>
            <ExtendedPreview format={format} separators={separators} />
        </div>
    );
});
