// (C) 2026 GoodData Corporation

import type * as z from "zod/mini";

import type { ParameterType } from "@gooddata/sdk-model";

import { validateYaml } from "../asCode/validateYaml.js";

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
    | {
          isValid: false;
          errorCode: ParameterValidationErrorCode;
          type?: ParameterType;
      };

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
    });

    if (result.ok) {
        return { isValid: true, parameter: result.data };
    }
    return result.kind === "schema"
        ? classifySchemaError(result.error, readDeclaredType(result.parsed))
        : invalid(result.kind);
}

type ParameterValidationFailure = Extract<ParameterValidationResult, { isValid: false }>;

function classifySchemaError(
    error: z.core.$ZodError,
    declaredType: ParameterType | undefined,
): ParameterValidationFailure {
    for (const issue of error.issues) {
        const path = issue.path.map(String).join(".");

        if (isSchemaErrorCode(issue.message)) {
            return invalid(issue.message, declaredType);
        }
        // The object's own `type`, not the model type inside `definition`. A mistyped one is easy to
        // make and impossible to spot in a generic structure error, so it gets its own message naming
        // the one value the field accepts.
        if (path === "type") {
            return invalid("invalidType");
        }
        if (path === "definition.type") {
            return invalid("unsupportedType");
        }
        if (path === "definition.defaultValue") {
            return invalid("invalidDefaultValue", declaredType);
        }
        if (path.startsWith("definition.constraints")) {
            return invalid("invalidConstraints", declaredType);
        }
        if (path === "tags" || path.startsWith("tags.")) {
            return invalid("invalidTags");
        }
    }

    return invalid("invalidStructure");
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

function invalid(code: ParameterValidationErrorCode, type?: ParameterType): ParameterValidationFailure {
    return {
        isValid: false,
        errorCode: code,
        type,
    };
}
