// (C) 2020-2025 GoodData Corporation
import React, { memo, useState, useCallback } from "react";
import { injectIntl, WrappedComponentProps } from "react-intl";
import { ISeparators } from "@gooddata/sdk-ui";
import { InputWithNumberFormat } from "../../../Form/index.js";

import { ExtendedPreview } from "./ExtendedPreview.js";
import { FormattedPreview } from "../shared/FormattedPreview.js";

const DEFAULT_PREVIEW_VALUE = -1234.5678;

interface ICustomFormatPreviewOwnProps {
    format: string;
    separators?: ISeparators;
}

type ICustomFormatPreviewProps = ICustomFormatPreviewOwnProps & WrappedComponentProps;

export const Preview = memo(function Preview(props: ICustomFormatPreviewProps) {
    const [preview, setPreview] = useState<number>(DEFAULT_PREVIEW_VALUE);

    const { format, separators, intl } = props;

    const onPreviewChange = useCallback((value: number): void => {
        setPreview(value);
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
                    isSmall={true}
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

export default injectIntl(Preview);
