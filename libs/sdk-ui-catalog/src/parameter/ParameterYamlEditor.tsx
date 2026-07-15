// (C) 2026 GoodData Corporation

import { useMemo } from "react";

import { defineMessages, useIntl } from "react-intl";

import type { ParameterType } from "@gooddata/sdk-model";
import { YamlEditor } from "@gooddata/sdk-ui-kit";

import { createParameterCompletions } from "./parameterCompletions.js";

const messages = defineMessages({
    syntaxError: { id: "analyticsCatalog.parameter.validation.syntax" },
});

type Props = {
    initialValue: string;
    enabledTypes: ParameterType[];
    onChange?: (value: string) => void;
    disabled?: boolean;
};

export function ParameterYamlEditor({ initialValue, enabledTypes, onChange, disabled = false }: Props) {
    const intl = useIntl();
    // The completion source narrows keys and `type:` values to the enabled parameter types, so it is
    // rebuilt whenever that set changes.
    const completionSource = useMemo(() => createParameterCompletions(enabledTypes), [enabledTypes]);

    return (
        <YamlEditor
            initialValue={initialValue}
            onChange={onChange}
            disabled={disabled}
            completionSource={completionSource}
            syntaxErrorMessage={intl.formatMessage(messages.syntaxError)}
        />
    );
}
