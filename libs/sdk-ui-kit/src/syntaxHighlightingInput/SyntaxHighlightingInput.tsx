// (C) 2020 GoodData Corporation
import * as React from "react";
import * as classNames from "classnames";
import { UnControlled as CodeMirrorInput, IDefineModeOptions } from "react-codemirror2";
import * as CodeMirror from "codemirror";
import "codemirror/lib/codemirror.css";
import "codemirror/addon/mode/simple";
import "codemirror/addon/edit/matchbrackets";
import "codemirror/addon/display/placeholder";

const defaultOptions = {
    autofocus: false,
    lineWrapping: true,
    matchBrackets: true,
};

/**
 * @alpha
 */
export interface ISyntaxHighlightingInputProps {
    value: string;
    onChange: (value: string) => void;
    formatting?: any;
    customOptions?: any;
    className?: string;
}

/**
 * @alpha
 */
export const SyntaxHighlightingInput: React.FC<ISyntaxHighlightingInputProps> = (props) => {
    const { value, onChange, formatting, customOptions, className } = props;

    const handleOnChange = (
        _editor: CodeMirror.Editor,
        _data: CodeMirror.EditorChange,
        value: string,
    ): void => {
        onChange(value);
    };

    const modeOptions: IDefineModeOptions = formatting && {
        name: "format",
        fn: (CodeMirror as any).defineSimpleMode("syntaxHighlight", formatting),
    };

    return (
        <CodeMirrorInput
            className={classNames(className, "gd-input-syntax-highlighting-input")}
            value={value}
            defineMode={modeOptions}
            onChange={handleOnChange}
            autoCursor={false}
            options={{
                ...defaultOptions,
                ...customOptions,
            }}
        />
    );
};
