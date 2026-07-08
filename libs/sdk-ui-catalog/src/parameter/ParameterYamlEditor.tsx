// (C) 2026 GoodData Corporation

import { useCallback, useMemo, useState } from "react";

import { yaml } from "@codemirror/lang-yaml";
import { lintGutter } from "@codemirror/lint";
import { lineNumbers } from "@codemirror/view";
import { useIntl } from "react-intl";

import { SyntaxHighlightingInput } from "@gooddata/sdk-ui-kit";

import { parameterSchemaCompletions } from "./parameterCompletions.js";
import { createYamlLinter } from "./yamlLinter.js";

type Props = {
    initialValue: string;
    onChange?: (value: string) => void;
    disabled?: boolean;
};

export function ParameterYamlEditor({ initialValue, onChange, disabled = false }: Props) {
    const intl = useIntl();
    const [value, setValue] = useState(initialValue);

    const extensions = useMemo(() => [yaml(), lineNumbers(), createYamlLinter(intl), lintGutter()], [intl]);

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
            onCompletion={parameterSchemaCompletions}
            disabled={disabled}
        />
    );
}
