// (C) 2020-2025 GoodData Corporation

import { memo, useCallback } from "react";

import { StreamLanguage } from "@codemirror/language";
import { useIntl } from "react-intl";

import { type ISeparators } from "@gooddata/sdk-ui";

import { FormatTemplatesDropdown } from "./formatTemplatesDropdown/FormatTemplatesDropdown.js";
import { SyntaxHighlightingInput } from "../../syntaxHighlightingInput/SyntaxHighlightingInput.js";
import { type IFormatTemplate } from "../typings.js";

type LanguageState = {
    isInColor: boolean;
    isInCustomColor: boolean;
    isInCondition: boolean;
    isInArithmeticExpression: boolean;
};

export const formattingLanguage = StreamLanguage.define<LanguageState>({
    startState(): LanguageState {
        return {
            isInColor: false,
            isInCustomColor: false,
            isInCondition: false,
            isInArithmeticExpression: false,
        };
    },

    token(stream, state) {
        // Arithmetic expressions
        if (
            state.isInArithmeticExpression ||
            stream.match(/^\{\{\{(?:\d+(?:\.\d+)?)?\|(?:\d+\.?)?\|[^}]+\}\}\}/, false)
        ) {
            if (stream.match("{{{")) {
                state.isInArithmeticExpression = true;
                return "bracket";
            }
            if (stream.match("}}}")) {
                state.isInArithmeticExpression = false;
                return "bracket";
            }
            if (stream.match(/^(?:\d+(?:\.\d+)?)?\|(?:\d+\.?)?\|/)) {
                return "variableName";
            }
            // For the last section, fall through, as arithmetic expression can contain other tokens
        }

        // Colors
        if (
            state.isInColor ||
            stream.match(/^\[(?:black|blue|cyan|green|magenta|red|white|yellow|none)\]/i, false)
        ) {
            if (stream.match("[")) {
                state.isInColor = true;
                return "bracket";
            }
            if (stream.match(/^[^\]]+/)) {
                return "keyword";
            }
            if (stream.match("]")) {
                state.isInColor = false;
                return "bracket";
            }
        }

        // Custom colors
        if (
            state.isInCustomColor ||
            stream.match(/^\[(?:backgroundColor|color)=#?(?:[a-f0-9]{6}|[a-f0-9]{3})\]/i, false)
        ) {
            if (stream.match("[")) {
                state.isInCustomColor = true;
                return "bracket";
            }
            if (stream.match("]")) {
                state.isInCustomColor = false;
                return "bracket";
            }
            if (stream.match(/^(?:backgroundColor|color)/i)) {
                return "variableName.special";
            }
            if (stream.match(/=/)) {
                return "bracket";
            }
            if (stream.match(/^#?(?:[a-f0-9]{6}|[a-f0-9]{3})/i)) {
                return "keyword";
            }
        }

        // Condition separator
        if (stream.match(";")) {
            return "bracket";
        }

        // Explicit conditions
        if (state.isInCondition || stream.match(/^\[(?:>=|<=|[<>=])-?(?:\d+(?:[.,]\d+)?|Null)\]/i, false)) {
            if (stream.match("[")) {
                state.isInCondition = true;
                return "bracket";
            }
            if (stream.match("]")) {
                state.isInCondition = false;
                return "bracket";
            }
            stream.eat(/^[^\]]/);
            return "variableName.standard";
        }

        // Escaping special characters
        if (stream.match(/^\\[0#?,.\\[\];]/)) {
            return "variableName";
        }

        // Number formatting
        if (stream.match(/^[0#?,]+(?:\.[0#?,]*)?/)) {
            return "string";
        }

        stream.next(); // Move the stream forward
        return "variableName";
    },
});

const codeMirrorExtensions = [formattingLanguage];

interface IFormatInputProps {
    format: string;
    onFormatChange: (format: string) => void;
    separators?: ISeparators;
    templates?: ReadonlyArray<IFormatTemplate>;
}

export const FormatInputWithIntl = memo(function FormatInputWithIntl(props: IFormatInputProps) {
    const { format, onFormatChange, separators, templates } = props;
    const intl = useIntl();

    const handleInputChange = useCallback(
        (value: string) => {
            onFormatChange(value);
        },
        [onFormatChange],
    );

    return (
        <div className={"gd-measure-custom-format-dialog-section"}>
            <div className={"gd-measure-custom-format-dialog-section-title"}>
                <span>{intl.formatMessage({ id: "measureNumberCustomFormatDialog.definition" })}</span>
                {templates?.length ? (
                    <FormatTemplatesDropdown
                        onChange={onFormatChange}
                        separators={separators}
                        templates={templates}
                    />
                ) : null}
            </div>
            <SyntaxHighlightingInput
                value={format}
                extensions={codeMirrorExtensions}
                onChange={handleInputChange}
                className={"s-custom-format-input"}
            />
        </div>
    );
});
