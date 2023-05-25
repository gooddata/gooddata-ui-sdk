// (C) 2020-2022 GoodData Corporation
import React from "react";
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

interface ICustomFormatPreviewState {
    preview: number;
}

type ICustomFormatPreviewProps = ICustomFormatPreviewOwnProps & WrappedComponentProps;

export class Preview extends React.PureComponent<ICustomFormatPreviewProps, ICustomFormatPreviewState> {
    public readonly state: Readonly<ICustomFormatPreviewState> = {
        preview: DEFAULT_PREVIEW_VALUE,
    };

    public render() {
        const { format, separators, intl } = this.props;

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
                        value={this.state.preview}
                        isSmall={true}
                        autofocus={false}
                        onChange={this.onPreviewChange}
                        separators={separators}
                    />
                    <FormattedPreview
                        previewNumber={this.state.preview}
                        format={format}
                        separators={separators}
                        className="s-custom-format-dialog-preview-formatted gd-measure-custom-format-dialog-preview-string"
                    />
                </div>
                <ExtendedPreview format={format} separators={separators} />
            </div>
        );
    }

    private onPreviewChange = (value: number): void => {
        this.setState({ preview: value });
    };
}

export default injectIntl(Preview);
