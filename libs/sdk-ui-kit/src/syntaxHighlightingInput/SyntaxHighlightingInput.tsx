// (C) 2020 GoodData Corporation
import * as React from "react";
import * as classNames from "classnames";
import { UnControlled as CodeMirrorInput, IDefineModeOptions } from "react-codemirror2";
import * as CodeMirror from "codemirror";
import "codemirror/lib/codemirror.css";
import "codemirror/addon/mode/simple";
import "codemirror/addon/edit/matchbrackets";
import "codemirror/addon/display/placeholder";

const CODE_MIRROR_EOL = "\n";

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
    onCursor?: (from: number, to: number) => void;
    formatting?: any;
    customOptions?: any;
    className?: string;
}

const findCursorIndexAcrossMultipleLines = (
    text: string,
    cursorLineIndex: number,
    cursorLineCharacterIndex: number,
): number => {
    const getLineLengthToCursor = (line: string, lineIndex: number) => {
        if (lineIndex > cursorLineIndex) {
            return 0;
        }
        return lineIndex < cursorLineIndex ? line.length + CODE_MIRROR_EOL.length : cursorLineCharacterIndex;
    };
    return text
        .split(CODE_MIRROR_EOL)
        .map(getLineLengthToCursor)
        .reduce((sum, lineLength) => sum + lineLength, 0);
};

/**
 * @alpha
 */
export const SyntaxHighlightingInput: React.FC<ISyntaxHighlightingInputProps> = (props) => {
    const { value, onChange, onCursor, formatting, customOptions, className } = props;

    const reportCursorPosition = (editor: CodeMirror.Editor): void => {
        if (onCursor) {
            const from = editor.getCursor("from");
            const to = editor.getCursor("to");
            const currentValue = editor.getValue();
            onCursor(
                findCursorIndexAcrossMultipleLines(currentValue, from.line, from.ch),
                findCursorIndexAcrossMultipleLines(currentValue, to.line, to.ch),
            );
        }
    };

    const handleOnChange = (editor: CodeMirror.Editor, _: CodeMirror.EditorChange, value: string): void => {
        onChange(value);
        reportCursorPosition(editor);
    };

    const handleOnBlur = (editor: CodeMirror.Editor): void => {
        reportCursorPosition(editor);
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
            onBlur={handleOnBlur}
            autoCursor={false}
            options={{
                ...defaultOptions,
                ...customOptions,
            }}
        />
    );
};
