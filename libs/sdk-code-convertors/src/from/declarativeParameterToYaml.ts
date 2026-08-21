// (C) 2026 GoodData Corporation

import { Document } from "yaml";

import { type StringParameterDefinition } from "@gooddata/api-client-tiger";
import type { Parameter } from "@gooddata/sdk-code-schemas/v1";

import {
    type DeclarativeStringParameter,
    optionalConstraints,
    toAllowedValue,
} from "../utils/parameterUtils.js";
import { PARAMETER_COMMENT } from "../utils/texts.js";
import { entryWithSpace, fillOptionalMetaFields } from "../utils/yamlUtils.js";

/** @public */
export function declarativeParameterToYaml(parameter: DeclarativeStringParameter): {
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
    definition: StringParameterDefinition,
): Parameter["definition"] {
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
