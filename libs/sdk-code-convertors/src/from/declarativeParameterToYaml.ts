// (C) 2026 GoodData Corporation

import { Document } from "yaml";

import {
    type DateRangeParameterDefinition,
    type NumberParameterDefinition,
    type StringParameterDefinition,
} from "@gooddata/api-client-tiger";
import type {
    Parameter,
    DateRangeParameterDefinition as YamlDateRangeDefinition,
    NumberParameterDefinition as YamlNumberDefinition,
    StringParameterDefinition as YamlStringDefinition,
} from "@gooddata/sdk-code-schemas/v1";

import {
    type DeclarativeCodeParameter,
    optionalConstraints,
    toAllowedValue,
    toDateRangeValue,
} from "../utils/parameterUtils.js";
import { PARAMETER_COMMENT, PERIOD_PARAMETER_COMMENT } from "../utils/texts.js";
import { entryWithSpace, fillOptionalMetaFields } from "../utils/yamlUtils.js";

/** @public */
export function declarativeParameterToYaml(parameter: DeclarativeCodeParameter): {
    content: string;
    json: Parameter;
} {
    // Create new doc and add mandatory fields right away
    const doc = new Document({
        type: "parameter",
        id: parameter.id,
    });

    // Add intro comment to the document
    doc.commentBefore =
        parameter.content.type === "DATE_RANGE" ? PERIOD_PARAMETER_COMMENT : PARAMETER_COMMENT;

    // Add optional meta fields
    fillOptionalMetaFields(doc, parameter);

    // Add the typed definition
    doc.add(
        entryWithSpace("definition", doc.createNode(declarativeParameterDefinitionToYaml(parameter.content))),
    );

    return {
        content: doc.toString({
            lineWidth: 0,
        }),
        json: doc.toJSON() as Parameter,
    };
}

function declarativeParameterDefinitionToYaml(
    definition: DeclarativeCodeParameter["content"],
): Parameter["definition"] {
    switch (definition.type) {
        case "STRING":
            return declarativeStringDefinitionToYaml(definition);
        case "NUMBER":
            return declarativeNumberDefinitionToYaml(definition);
        case "DATE_RANGE":
            return declarativeDateRangeDefinitionToYaml(definition);
    }
}

function declarativeStringDefinitionToYaml(definition: StringParameterDefinition): YamlStringDefinition {
    const { minLength, maxLength, allowedValues } = definition.constraints ?? {};
    // The schema requires a non-empty list, so an empty one from the server means "free text".
    const [first, ...rest] = allowedValues ?? [];

    return {
        type: "STRING",
        defaultValue: definition.defaultValue,
        ...optionalConstraints({
            minLength,
            maxLength,
            allowedValues: first ? [toAllowedValue(first), ...rest.map(toAllowedValue)] : undefined,
        }),
    };
}

function declarativeNumberDefinitionToYaml(definition: NumberParameterDefinition): YamlNumberDefinition {
    const { min, max } = definition.constraints ?? {};

    return {
        type: "NUMBER",
        defaultValue: definition.defaultValue,
        ...optionalConstraints({ min, max }),
    };
}

function declarativeDateRangeDefinitionToYaml(
    definition: DateRangeParameterDefinition,
): YamlDateRangeDefinition {
    return {
        type: "DATE_RANGE",
        defaultValue: toDateRangeValue(definition.defaultValue),
    };
}
