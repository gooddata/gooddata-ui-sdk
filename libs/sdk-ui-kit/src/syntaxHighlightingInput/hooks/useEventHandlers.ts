// (C) 2025 GoodData Corporation
import { useRef } from "react";
import { EditorView } from "@codemirror/view";
import { CompletionSource } from "@codemirror/autocomplete";

export interface IUseEventHandlersProps {
    onChange: (value: string) => void;
    onCursor?: (from: number, to: number) => void;
    onCompletion?: CompletionSource;
    onKeyDown?: (event: KeyboardEvent, view: EditorView) => boolean;
}

export function useEventHandlers({ onChange, onKeyDown, onCursor, onCompletion }: IUseEventHandlersProps) {
    const handleKeyDown = useRef(onKeyDown);
    handleKeyDown.current = onKeyDown;

    const handleChange = useRef(onChange);
    handleChange.current = onChange;

    const handleCursor = useRef(onCursor);
    handleCursor.current = onCursor;

    const handleCompletion = useRef(onCompletion);
    handleCompletion.current = onCompletion;

    return {
        handleChange,
        handleCursor,
        handleKeyDown,
        handleCompletion,
    };
}
