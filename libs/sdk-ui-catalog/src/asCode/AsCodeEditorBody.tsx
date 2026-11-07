// (C) 2026 GoodData Corporation

import { useMemo, useState } from "react";

import { defineMessages, useIntl } from "react-intl";

import { type IUiConfigEditorDiagnostic, UiConfigEditor } from "@gooddata/sdk-ui-kit";

import type { AsCodeValidation, AsCodeValidationContext, IAsCodeEditing } from "./descriptor.js";

const messages = defineMessages({
    autoFormat: { id: "analyticsCatalog.asCode.dialog.autoFormat" },
});

type Props = {
    initialValue: string;
    onChange: (value: string) => void;
    disabled: boolean;
    readOnly?: boolean;
    editing: IAsCodeEditing<unknown>;
    validationContext: AsCodeValidationContext;
    /** Accessible name for the editor; the dialog derives it from the entity's section header. */
    label: string;
};

/**
 * The editor half of {@link AsCodeDialog}, split into its own module so the dialog can `lazy()`-load
 * it: this keeps CodeMirror out of the eager catalog bundle. The completion source,
 * validation and syntax-error copy come from the entity's descriptor, so this stays entity-agnostic.
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
    readOnly,
    editing,
    validationContext,
    label,
}: Props) {
    const intl = useIntl();
    const [value, setValue] = useState(initialValue);
    // A read-only view has no typing to guide, and its document may predate a narrower feature gate.
    const diagnostics = useMemo(
        () => (readOnly ? [] : inlineDiagnostics(editing.validate(value, validationContext))),
        [editing, readOnly, validationContext, value],
    );

    return (
        <UiConfigEditor
            value={value}
            onChange={(next) => {
                setValue(next);
                onChange(next);
            }}
            primaryLanguage="yaml"
            languages={["yaml"]}
            completionSource={editing.completionSource}
            diagnostics={diagnostics}
            label={label}
            disabled={disabled}
            readOnly={readOnly}
            labels={{
                autoFormat: intl.formatMessage(messages.autoFormat),
                syntaxError: editing.syntaxErrorMessage,
            }}
        />
    );
}

function inlineDiagnostics(result: AsCodeValidation<unknown>): IUiConfigEditorDiagnostic[] {
    return result.isValid || result.path === undefined
        ? []
        : [{ path: result.path, target: result.target, severity: "error", message: result.error }];
}
