// (C) 2026 GoodData Corporation

import type { CompletionSource } from "@codemirror/autocomplete";

import { YamlEditor } from "@gooddata/sdk-ui-kit";

type Props = {
    initialValue: string;
    onChange: (value: string) => void;
    disabled: boolean;
    completionSource: CompletionSource;
    syntaxErrorMessage: string;
};

/**
 * The editor half of {@link AsCodeDialog}, split into its own module so the dialog can `lazy()`-load
 * it: this keeps CodeMirror out of the eager catalog bundle. The completion source and syntax-error
 * copy come from the entity's descriptor, so this stays entity-agnostic.
 */
export function AsCodeEditorBody({
    initialValue,
    onChange,
    disabled,
    completionSource,
    syntaxErrorMessage,
}: Props) {
    return (
        <YamlEditor
            initialValue={initialValue}
            onChange={onChange}
            disabled={disabled}
            completionSource={completionSource}
            syntaxErrorMessage={syntaxErrorMessage}
        />
    );
}
