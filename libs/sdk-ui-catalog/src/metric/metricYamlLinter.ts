// (C) 2026 GoodData Corporation

import { type IntlShape, defineMessages } from "react-intl";

import { createYamlSyntaxLinter } from "../utils/yamlSyntaxLinter.js";

const messages = defineMessages({
    syntaxError: { id: "analyticsCatalog.metric.validation.syntax" },
});

/**
 * Creates a CodeMirror linter extension that reports YAML syntax errors
 * using the metric-specific syntax error message.
 */
export function createMetricYamlLinter(intl: IntlShape) {
    return createYamlSyntaxLinter(intl.formatMessage(messages.syntaxError));
}
