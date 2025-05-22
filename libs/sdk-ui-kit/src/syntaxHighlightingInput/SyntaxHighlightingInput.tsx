// (C) 2020-2025 GoodData Corporation
import React from "react";
import cx from "classnames";
import { EditorView } from "@codemirror/view";
import { Extension } from "@codemirror/state";
import { CompletionSource } from "@codemirror/autocomplete";

import { useCodemirror } from "./hooks/useCodemirror.js";

/**
 * @internal
 */
export interface ISyntaxHighlightingInputProps {
    value: string;
    label?: string;
    disabled?: boolean;
    className?: string;
    placeholder?: string;
    extensions?: Extension[];
    onChange: (value: string) => void;
    onApi?: (view: EditorView | null) => void;
    onCursor?: (from: number, to: number) => void;
    onKeyDown?: (event: KeyboardEvent, view: EditorView) => boolean;
    autocompletion?: {
        whenTyping?: boolean;
        aboveCursor?: boolean;
    };
    onCompletion?: CompletionSource;
}

/**
 * @internal
 */
export const SyntaxHighlightingInput: React.FC<ISyntaxHighlightingInputProps> = (props) => {
    const {
        value,
        label,
        placeholder,
        autocompletion,
        onApi,
        onChange,
        onCursor,
        onKeyDown,
        onCompletion,
        className,
        extensions = [],
        disabled,
    } = props;

    const { editorRef } = useCodemirror({
        placeholderText: placeholder,
        autocompletion,
        label,
        extensions,
        disabled,
        value,
        onCursor,
        onApi,
        onChange,
        onKeyDown,
        onCompletion,
    });

    return <div className={cx(className, "gd-input-syntax-highlighting-input")} ref={editorRef} />;
};
