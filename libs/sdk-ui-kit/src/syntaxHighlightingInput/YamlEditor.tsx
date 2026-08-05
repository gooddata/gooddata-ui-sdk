// (C) 2026 GoodData Corporation

import { useMemo, useState } from "react";

import { type CompletionSource } from "@codemirror/autocomplete";
import { yaml } from "@codemirror/lang-yaml";
import { lintGutter } from "@codemirror/lint";
import { type Extension } from "@codemirror/state";
import { lineNumbers } from "@codemirror/view";

import { SyntaxHighlightingInput } from "./SyntaxHighlightingInput.js";
import { type YamlCompletionSource, yamlPositionAt } from "./yamlPosition.js";
import { createYamlSyntaxLinter } from "./yamlSyntaxLinter.js";

const noop = () => {};

/**
 * @internal
 */
export interface IYamlEditorProps {
    initialValue: string;
    onChange?: (value: string) => void;
    disabled?: boolean;
    /** Accessible name for the editor (wired to its aria-label). */
    label?: string;
    completionSource?: YamlCompletionSource;
    /**
     * When set, wires the built-in YAML syntax linter with this (localized) diagnostic message.
     * Applied once when the editor mounts; later changes are not re-applied.
     */
    syntaxErrorMessage?: string;
    /**
     * Extra CodeMirror extensions, appended after the YAML defaults. Applied once when the editor
     * mounts; later changes are not re-applied.
     */
    extensions?: Extension[];
    placeholder?: string;
}

/**
 * A YAML source editor: syntax highlighting, line numbers, a lint gutter, an optional syntax linter,
 * and optional schema-aware autocompletion. Generic YAML plumbing lives here; schema-specific policy
 * (the completion source, the syntax-error message, value handling) is injected by the caller.
 *
 * Uncontrolled: it seeds from `initialValue` and reports edits through `onChange`; the parent reads
 * the current value from `onChange`, never by re-driving `initialValue`.
 * @internal
 */
export function YamlEditor({
    initialValue,
    onChange,
    disabled = false,
    label,
    completionSource,
    syntaxErrorMessage,
    extensions,
    placeholder,
}: IYamlEditorProps) {
    const [seedValue] = useState(initialValue);
    const onCompletion = useMemo<CompletionSource | undefined>(
        () =>
            completionSource &&
            ((context) => completionSource(context, yamlPositionAt(context.state, context.pos))),
        [completionSource],
    );
    const [allExtensions] = useState(() => [
        yaml(),
        lineNumbers(),
        lintGutter(),
        ...(syntaxErrorMessage ? [createYamlSyntaxLinter(syntaxErrorMessage)] : []),
        ...(extensions ?? []),
    ]);

    return (
        <SyntaxHighlightingInput
            label={label}
            value={seedValue}
            onChange={onChange ?? noop}
            extensions={allExtensions}
            onCompletion={onCompletion}
            disabled={disabled}
            placeholder={placeholder}
        />
    );
}
