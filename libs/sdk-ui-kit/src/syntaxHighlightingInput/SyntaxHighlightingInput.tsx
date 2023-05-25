// (C) 2020-2023 GoodData Corporation
import React, { useRef, useEffect } from "react";
import cx from "classnames";
import CodeMirror from "codemirror";
// eslint-disable-next-line import/no-unassigned-import
import "codemirror/addon/mode/simple.js";
// eslint-disable-next-line import/no-unassigned-import
import "codemirror/addon/edit/matchbrackets.js";
// eslint-disable-next-line import/no-unassigned-import
import "codemirror/addon/display/placeholder.js";

const CODE_MIRROR_EOL = "\n";

const defaultOptions = {
    autofocus: false,
    lineWrapping: true,
    matchBrackets: true,
};

/**
 * @internal
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
 * @internal
 */
export const SyntaxHighlightingInput: React.FC<ISyntaxHighlightingInputProps> = (props) => {
    const { value, onChange, onCursor, customOptions, className, formatting } = props;

    const ref = useRef<HTMLDivElement>();
    const view = useRef<CodeMirror.Editor>();

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

    const handleOnChange = (): void => {
        onChange(view.current.getValue());
    };

    useEffect(() => {
        (CodeMirror as any).defineSimpleMode("syntaxHighlight", formatting);

        view.current = CodeMirror(ref.current, {
            ...customOptions,
            ...defaultOptions,
            mode: "syntaxHighlight",
            value,
        });

        view.current.on("change", handleOnChange);
        view.current.on("cursorActivity", reportCursorPosition);

        return () => {
            view.current.off("change", handleOnChange);
            view.current.off("cursorActivity", reportCursorPosition);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const cursor = view.current.getCursor();
        view.current.setValue(value);
        view.current.setCursor(cursor);
    }, [value]);

    return <div className={cx(className, "gd-input-syntax-highlighting-input")} ref={ref} />;
};
