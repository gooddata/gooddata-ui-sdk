// (C) 2026 GoodData Corporation

import { useState } from "react";

import { defineMessages, useIntl } from "react-intl";

import { UiConfigEditor, type YamlCompletionSource } from "@gooddata/sdk-ui-kit";

const messages = defineMessages({
    autoFormat: { id: "analyticsCatalog.asCode.dialog.autoFormat" },
});

type Props = {
    initialValue: string;
    onChange: (value: string) => void;
    disabled: boolean;
    completionSource: YamlCompletionSource;
    syntaxErrorMessage: string;
    /** Accessible name for the editor; the dialog derives it from the entity's section header. */
    label: string;
};

/**
 * The editor half of {@link AsCodeDialog}, split into its own module so the dialog can `lazy()`-load
 * it: this keeps CodeMirror out of the eager catalog bundle. The completion source and syntax-error
 * copy come from the entity's descriptor, so this stays entity-agnostic.
 *
 * YAML is both the only language on offer and the primary one, so the kit editor never converts
 * anything: the text the user sees — comments, formatting and all — is exactly what `onChange`
 * reports. The dialog reads the current value from `onChange` and never drives the value back in,
 * which the local state here preserves.
 */
export function AsCodeEditorBody({
    initialValue,
    onChange,
    disabled,
    completionSource,
    syntaxErrorMessage,
    label,
}: Props) {
    const intl = useIntl();
    const [value, setValue] = useState(initialValue);

    return (
        <UiConfigEditor
            value={value}
            onChange={(next) => {
                setValue(next);
                onChange(next);
            }}
            primaryLanguage="yaml"
            languages={["yaml"]}
            completionSource={completionSource}
            label={label}
            disabled={disabled}
            labels={{
                autoFormat: intl.formatMessage(messages.autoFormat),
                syntaxError: syntaxErrorMessage,
            }}
        />
    );
}
