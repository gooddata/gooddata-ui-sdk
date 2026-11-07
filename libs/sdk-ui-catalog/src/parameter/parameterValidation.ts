// (C) 2026 GoodData Corporation

import type * as z from "zod/mini";

import type { ParameterType } from "@gooddata/sdk-model";

import { type YamlValidationFailure, validateYaml } from "../asCode/validateYaml.js";

import {
    type ParameterSchema,
    type SchemaErrorCode,
    buildParameterSchema,
    schemaErrorCodes,
} from "./parameterSchema.js";

export type ParameterValidationResult =
    | {
          isValid: true;
          parameter: ParameterSchema;
      }
    | YamlValidationFailure<ParameterFailure>;

type ParameterFailure = { errorCode: ParameterValidationErrorCode; type?: ParameterType };

export type ParameterValidationErrorCode =
    | "empty"
    | "syntax"
    | "invalidStructure"
    | "idImmutable"
    | "invalidType"
    | "unsupportedType"
    | "invalidDefaultValue"
    | "invalidConstraints"
    | "invalidTags"
    | SchemaErrorCode;

type ValidateParameterYamlOptions = {
    enabledTypes: ParameterType[];
    fixedIdentifier?: string;
};

export function validateParameterYaml(
    value: string,
    options: ValidateParameterYamlOptions,
): ParameterValidationResult {
    const result = validateYaml(value, {
        schema: buildParameterSchema(options.enabledTypes),
        fixedIdentifier: options.fixedIdentifier,
        classifyIssue: classifyParameterIssue,
    });

    if (result.isValid) {
        return { isValid: true, parameter: result.data };
    }
    return result;
}

function classifyParameterIssue(
    path: string,
    parsed: unknown,
    issue: z.core.$ZodIssue,
): ParameterFailure | undefined {
    const declaredType = readDeclaredType(parsed);
    if (isSchemaErrorCode(issue.message)) {
        return { errorCode: issue.message, type: declaredType };
    }
    // The object's own `type`, not the model type inside `definition`. A mistyped one is easy to
    // make and impossible to spot in a generic structure error, so it gets its own message naming
    // the one value the field accepts.
    if (path === "type") {
        return { errorCode: "invalidType" };
    }
    if (path === "definition.type") {
        return { errorCode: "unsupportedType" };
    }
    if (path === "definition.defaultValue") {
        return { errorCode: "invalidDefaultValue", type: declaredType };
    }
    if (path.startsWith("definition.constraints")) {
        return { errorCode: "invalidConstraints", type: declaredType };
    }
    if (path === "tags" || path.startsWith("tags.")) {
        return { errorCode: "invalidTags" };
    }
    return undefined;
}

const schemaErrorCodeSet: ReadonlySet<string> = new Set(schemaErrorCodes);

function isSchemaErrorCode(message: string): message is SchemaErrorCode {
    return schemaErrorCodeSet.has(message);
}

function readDeclaredType(parsed: unknown): ParameterType | undefined {
    if (!parsed || typeof parsed !== "object") {
        return undefined;
    }
    const { definition } = parsed as { definition?: unknown };
    if (!definition || typeof definition !== "object") {
        return undefined;
    }
    const { type } = definition as { type?: unknown };
    return type === "NUMBER" || type === "STRING" ? type : undefined;
}
