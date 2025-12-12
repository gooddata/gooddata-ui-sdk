// (C) 2025 GoodData Corporation
import { useRef } from "react";

import { type CompletionSource } from "@codemirror/autocomplete";
import { type EditorView } from "@codemirror/view";

export interface IUseEventHandlersProps {
    onChange: (value: string) => void;
    onCursor?: (from: number, to: number) => void;
    onCompletion?: CompletionSource;
    onKeyDown?: (event: KeyboardEvent, view: EditorView) => boolean;
    onFocus?: (event: FocusEvent, view: EditorView) => void;
    onBlur?: (event: FocusEvent, view: EditorView) => void;
}

export function useEventHandlers({
    onChange,
    onKeyDown,
    onCursor,
    onCompletion,
    onFocus,
    onBlur,
}: IUseEventHandlersProps) {
    const handleKeyDown = useRef(onKeyDown);
    handleKeyDown.current = onKeyDown;

    const handleChange = useRef(onChange);
    handleChange.current = onChange;

    const handleCursor = useRef(onCursor);
    handleCursor.current = onCursor;

    const handleCompletion = useRef(onCompletion);
    handleCompletion.current = onCompletion;

    const handleFocus = useRef(onFocus);
    handleFocus.current = onFocus;

    const handleBlur = useRef(onBlur);
    handleBlur.current = onBlur;

    return {
        handleChange,
        handleCursor,
        handleKeyDown,
        handleCompletion,
        handleFocus,
        handleBlur,
    };
}
