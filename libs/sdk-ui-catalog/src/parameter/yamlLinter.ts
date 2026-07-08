// (C) 2026 GoodData Corporation

import { type IntlShape, defineMessages } from "react-intl";

import { createYamlSyntaxLinter } from "../utils/yamlSyntaxLinter.js";

const messages = defineMessages({
    syntaxError: { id: "analyticsCatalog.parameter.validation.syntax" },
});

/**
 * Creates a CodeMirror linter extension that reports YAML syntax errors
 * using the parameter-specific syntax error message.
 */
export function createYamlLinter(intl: IntlShape) {
    return createYamlSyntaxLinter(intl.formatMessage(messages.syntaxError));
}
