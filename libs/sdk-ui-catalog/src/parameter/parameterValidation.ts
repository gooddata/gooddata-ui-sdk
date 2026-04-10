// (C) 2026 GoodData Corporation

import { parse as parseYaml } from "yaml";
import type * as z from "zod/mini";

import { type ParameterSchema, parameterSchema } from "./parameterSchema.js";

export type ParameterValidationResult =
    | {
          isValid: true;
          parameter: ParameterSchema;
      }
    | {
          isValid: false;
          errorCode: ParameterValidationErrorCode;
      };

export type ParameterValidationErrorCode =
    | "empty"
    | "syntax"
    | "invalidStructure"
    | "idImmutable"
    | "unsupportedType"
    | "invalidDefaultValue"
    | "invalidConstraints"
    | "invalidConstraintRange"
    | "invalidTags";

type ValidateParameterYamlOptions = {
    fixedIdentifier?: string;
};

export function validateParameterYaml(
    value: string,
    options: ValidateParameterYamlOptions = {},
): ParameterValidationResult {
    if (value.trim() === "") {
        return invalid("empty");
    }

    let parsed: unknown;
    try {
        parsed = parseYaml(value, { strict: true });
    } catch {
        return invalid("syntax");
    }

    const result = parameterSchema.safeParse(parsed);
    if (!result.success) {
        return classifySchemaError(result.error);
    }

    if (options.fixedIdentifier !== undefined && result.data.id !== options.fixedIdentifier) {
        return invalid("idImmutable");
    }

    return {
        isValid: true,
        parameter: result.data,
    };
}

function classifySchemaError(error: z.core.$ZodError): ParameterValidationResult {
    for (const issue of error.issues) {
        const path = issue.path.map(String).join(".");

        if (issue.code === "custom") {
            if (issue.message === "invalidConstraintRange") {
                return invalid("invalidConstraintRange");
            }
        }
        if (path === "definition.type") {
            return invalid("unsupportedType");
        }
        if (path === "definition.defaultValue") {
            return invalid("invalidDefaultValue");
        }
        if (path.startsWith("definition.constraints")) {
            return invalid("invalidConstraints");
        }
        if (path === "tags" || path.startsWith("tags.")) {
            return invalid("invalidTags");
        }
    }

    return invalid("invalidStructure");
}

function invalid(code: ParameterValidationErrorCode): ParameterValidationResult {
    return {
        isValid: false,
        errorCode: code,
    };
}
