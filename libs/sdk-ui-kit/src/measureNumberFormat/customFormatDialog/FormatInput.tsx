// (C) 2020 GoodData Corporation
import * as React from "react";
import { injectIntl, WrappedComponentProps } from "react-intl";
import { ISeparators } from "@gooddata/sdk-ui";

import { FormatTemplatesDropdown } from "./formatTemplatesDropdown/FormatTemplatesDropdown";
import { SyntaxHighlightingInput } from "./SyntaxHighlightingInput";
import { IFormatTemplate } from "../typings";

interface IFormatInputOwnProps {
    format: string;
    onFormatChange: (format: string) => void;
    separators?: ISeparators;
    templates?: ReadonlyArray<IFormatTemplate>;
}

type IFormatInputProps = IFormatInputOwnProps & WrappedComponentProps;

class FormatInput extends React.PureComponent<IFormatInputProps> {
    public render() {
        const { format, onFormatChange, separators, templates, intl } = this.props;
        return (
            <div className={"gd-measure-custom-format-dialog-section"}>
                <div className={"gd-measure-custom-format-dialog-section-title"}>
                    <span>{intl.formatMessage({ id: "measureNumberCustomFormatDialog.definition" })}</span>
                    {templates && (
                        <FormatTemplatesDropdown
                            onChange={onFormatChange}
                            separators={separators}
                            templates={templates}
                        />
                    )}
                </div>
                <SyntaxHighlightingInput
                    value={format}
                    onChangeHandler={this.handleInputChange}
                    className={"s-custom-format-input gd-input-syntax-highlighting-input"}
                />
            </div>
        );
    }

    private handleInputChange = (value: string) => {
        this.props.onFormatChange(value);
    };
}

const FormatInputWithIntl = injectIntl(FormatInput);

export default FormatInputWithIntl;
