// (C) 2020 GoodData Corporation
import * as React from "react";
import { UnControlled as CodeMirrorInput } from "react-codemirror2";
import * as CodeMirror from "codemirror";
import "codemirror/lib/codemirror.css";
import "codemirror/addon/mode/simple";
import "codemirror/addon/edit/matchbrackets";

const measureFormatMode = (CodeMirror as any).defineSimpleMode("numberFormat", {
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
});

export interface ISyntaxHighlightingProps {
    value: string;
    onChangeHandler?: (value: string) => void;
    className?: string;
}

export const SyntaxHighlightingInput: React.FC<ISyntaxHighlightingProps> = (props) => {
    const { value, onChangeHandler, className } = props;

    const onChange = (_editor: CodeMirror.Editor, _data: CodeMirror.EditorChange, value: string): void => {
        onChangeHandler?.(value);
    };

    return (
        <CodeMirrorInput
            className={className}
            value={value}
            defineMode={{ name: "format", fn: measureFormatMode }}
            onChange={onChange}
            autoCursor={false}
            options={{
                autofocus: false,
                lineWrapping: true,
                matchBrackets: true,
                mode: "numberFormat",
            }}
        />
    );
};
