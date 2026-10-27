// (C) 2026 GoodData Corporation

import { escapeString } from "@gooddata/maql-antlr4ts";
import { type IParameterDefinition, isStringParameterDefinition } from "@gooddata/sdk-model";

export function parameterTypeLabel(definition: IParameterDefinition): string {
    return definition.type.toLowerCase();
}

export function parameterDefaultLabel(definition: IParameterDefinition): string {
    return JSON.stringify(definition.defaultValue);
}

export function parameterSummary(definition: IParameterDefinition): string {
    return `${parameterTypeLabel(definition)}, default: ${parameterDefaultLabel(definition)}`;
}

/**
 * Whether a definition describes a default that can be written into MAQL. A parameter file being
 * edited reaches us with a type it has not finished, or a default of the wrong kind for the type it
 * declares, neither of which the declared type admits.
 */
export function isRenderableDefinition(definition: unknown): definition is IParameterDefinition {
    const candidate = definition as Partial<IParameterDefinition> | null | undefined;
    switch (candidate?.type) {
        case "STRING":
            return typeof candidate.defaultValue === "string";
        case "NUMBER":
            return typeof candidate.defaultValue === "number";
        default:
            return false;
    }
}

/**
 * The parameter's default as it would be written in MAQL: string defaults quoted and escaped,
 * numeric ones bare.
 */
export function parameterMaqlLiteral(definition: IParameterDefinition): string {
    return isStringParameterDefinition(definition)
        ? escapeString(definition.defaultValue, '"')
        : String(definition.defaultValue);
}
