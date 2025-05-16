// (C) 2020-2025 GoodData Corporation
import React from "react";
import cx from "classnames";
import { EditorView } from "@codemirror/view";
import { Extension } from "@codemirror/state";
import { useCodemirror } from "./hooks/useCodemirror.js";

/**
 * @internal
 */
export interface ISyntaxHighlightingInputProps {
    value: string;
    onChange: (value: string) => void;
    onApi?: (view: EditorView | null) => void;
    onCursor?: (from: number, to: number) => void;
    onKeyDown?: (event: KeyboardEvent, view: EditorView) => boolean;
    placeholder?: string;
    label?: string;
    extensions?: Extension[];
    className?: string;
    disabled?: boolean;
}

/**
 * @internal
 */
export const SyntaxHighlightingInput: React.FC<ISyntaxHighlightingInputProps> = (props) => {
    const {
        value,
        label,
        placeholder,
        onApi,
        onChange,
        onCursor,
        onKeyDown,
        className,
        extensions = [],
        disabled,
    } = props;

    const { editorRef } = useCodemirror({
        placeholderText: placeholder,
        label,
        extensions,
        disabled,
        value,
        onCursor,
        onApi,
        onChange,
        onKeyDown,
    });

    return <div className={cx(className, "gd-input-syntax-highlighting-input")} ref={editorRef} />;
};
