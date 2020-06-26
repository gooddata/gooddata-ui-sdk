// (C) 2020 GoodData Corporation
import * as React from "react";
import { injectIntl, WrappedComponentProps } from "react-intl";
import { ISeparators } from "@gooddata/sdk-ui";

import { FormatTemplatesDropdown } from "./formatTemplatesDropdown/FormatTemplatesDropdown";
import { SyntaxHighlightingInput } from "../../syntaxHighlightingInput/SyntaxHighlightingInput";
import { IFormatTemplate } from "../typings";

const formattingRules = {
    start: [
        { regex: /"(?:[^\\]|\\.)*?"/, token: "string" },
        { regex: /(?:black|blue|cyan|green|magenta|red|yellow|white)\b/i, token: "keyword" },
        {
            regex: /(backgroundColor|color)(=)([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})/i,
            token: ["variable-4", null, "keyword"],
        },
        {
            regex: /(<|>|=|>=|<=)(-?)(\d*(\.|,)?\d+|Null)/i,
            token: ["variable-5", "variable-5", "variable-5"],
        },
        { regex: /\/\/.*/, token: "comment" },
        { regex: /\/(?:[^\\]|\\.)*?\//, token: "variable-3" },
        { regex: /\/\*/, token: "comment", next: "comment" },
        { regex: /[\{\[\(]/, indent: true, token: "variable-brackets" },
        { regex: /[\}\]\)]/, dedent: true, token: "variable-brackets" },
        { regex: /[a-z$][\w$]*/, token: "variable" },
        { regex: /<</, token: "meta", mode: { spec: "xml", end: />>/ } },
    ],
    comment: [
        { regex: /.*?\*\//, token: "comment", next: "start" },
        { regex: /.*/, token: "comment" },
    ],
    meta: {
        dontIndentStates: ["comment"],
        lineComment: "//",
    },
};

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
                    formatting={formattingRules}
                    onChange={this.handleInputChange}
                    className={"s-custom-format-input"}
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
