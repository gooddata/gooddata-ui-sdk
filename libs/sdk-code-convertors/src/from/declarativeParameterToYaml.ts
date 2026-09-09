// (C) 2026 GoodData Corporation

import { Document } from "yaml";

import { type NumberParameterDefinition, type StringParameterDefinition } from "@gooddata/api-client-tiger";
import type {
    Parameter,
    NumberParameterDefinition as YamlNumberDefinition,
    StringParameterDefinition as YamlStringDefinition,
} from "@gooddata/sdk-code-schemas/v1";

import {
    type DeclarativeCodeParameter,
    optionalConstraints,
    toAllowedValue,
} from "../utils/parameterUtils.js";
import { PARAMETER_COMMENT } from "../utils/texts.js";
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
    doc.commentBefore = PARAMETER_COMMENT;

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
    return definition.type === "NUMBER"
        ? declarativeNumberDefinitionToYaml(definition)
        : declarativeStringDefinitionToYaml(definition);
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
