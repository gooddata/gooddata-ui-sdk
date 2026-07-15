// (C) 2026 GoodData Corporation

import { defineMessages, useIntl } from "react-intl";

import { YamlEditor } from "@gooddata/sdk-ui-kit";

import { metricCompletions } from "./metricCompletions.js";

const messages = defineMessages({
    syntaxError: { id: "analyticsCatalog.metric.validation.syntax" },
});

type Props = {
    initialValue: string;
    onChange?: (value: string) => void;
    disabled?: boolean;
};

export function MetricYamlEditor({ initialValue, onChange, disabled = false }: Props) {
    const intl = useIntl();
    return (
        <YamlEditor
            initialValue={initialValue}
            onChange={onChange}
            disabled={disabled}
            completionSource={metricCompletions}
            syntaxErrorMessage={intl.formatMessage(messages.syntaxError)}
        />
    );
}
