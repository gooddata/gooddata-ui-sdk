// (C) 2026 GoodData Corporation

import { useCallback, useMemo, useState } from "react";

import { yaml } from "@codemirror/lang-yaml";
import { lintGutter } from "@codemirror/lint";
import { lineNumbers } from "@codemirror/view";
import { useIntl } from "react-intl";

import type { ParameterType } from "@gooddata/sdk-model";
import { SyntaxHighlightingInput } from "@gooddata/sdk-ui-kit";

import { createParameterCompletions } from "./parameterCompletions.js";
import { createYamlLinter } from "./yamlLinter.js";

type Props = {
    initialValue: string;
    enabledTypes: ParameterType[];
    onChange?: (value: string) => void;
    disabled?: boolean;
};

export function ParameterYamlEditor({ initialValue, enabledTypes, onChange, disabled = false }: Props) {
    const intl = useIntl();
    const [value, setValue] = useState(initialValue);

    const extensions = useMemo(() => [yaml(), lineNumbers(), createYamlLinter(intl), lintGutter()], [intl]);
    const completions = useMemo(() => createParameterCompletions(enabledTypes), [enabledTypes]);

    const handleChange = useCallback(
        (nextValue: string) => {
            setValue(nextValue);
            onChange?.(nextValue);
        },
        [onChange],
    );

    return (
        <SyntaxHighlightingInput
            className="gd-ascode-dialog-editor-input"
            value={value}
            onChange={handleChange}
            extensions={extensions}
            onCompletion={completions}
            disabled={disabled}
        />
    );
}
