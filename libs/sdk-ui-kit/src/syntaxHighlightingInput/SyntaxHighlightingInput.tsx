// (C) 2020-2026 GoodData Corporation

import { type CompletionSource } from "@codemirror/autocomplete";
import { type Extension } from "@codemirror/state";
import { type EditorView } from "@codemirror/view";
import cx from "classnames";

import { useCodemirror } from "./hooks/useCodemirror.js";
import { type ExternalChangeSelection } from "./hooks/useCodemirrorChange.js";

/**
 * @internal
 */
export interface ISyntaxHighlightingInputProps {
    value: string;
    label?: string;
    disabled?: boolean;
    className?: string;
    placeholder?: string;
    beforeExtensions?: Extension[];
    extensions?: Extension[];
    onChange: (value: string) => void;
    onFocus?: (event: FocusEvent, view: EditorView) => void;
    onBlur?: (event: FocusEvent, view: EditorView) => void;
    onApi?: (view: EditorView | null) => void;
    onCursor?: (from: number, to: number) => void;
    onKeyDown?: (event: KeyboardEvent, view: EditorView) => boolean;
    autocompletion?: {
        whenTyping?: boolean;
        whenTypingDelay?: number;
        aboveCursor?: boolean;
    };
    onCompletion?: CompletionSource;
    /**
     * Where the selection goes when the controlled `value` is replaced from outside: clamped in
     * place (default), or at the end of the new document.
     */
    externalChangeSelection?: ExternalChangeSelection;
}

/**
 * @internal
 */
export function SyntaxHighlightingInput({
    value,
    label,
    placeholder,
    autocompletion,
    onApi,
    onChange,
    onCursor,
    onKeyDown,
    onCompletion,
    onFocus,
    onBlur,
    className,
    beforeExtensions = [],
    extensions = [],
    disabled,
    externalChangeSelection,
}: ISyntaxHighlightingInputProps) {
    const { editorRef } = useCodemirror({
        placeholderText: placeholder,
        autocompletion,
        label,
        beforeExtensions,
        extensions,
        disabled,
        value,
        onCursor,
        onApi,
        onChange,
        onKeyDown,
        onCompletion,
        onFocus,
        onBlur,
        externalChangeSelection,
    });

    return <div className={cx(className, "gd-input-syntax-highlighting-input")} ref={editorRef} />;
}
