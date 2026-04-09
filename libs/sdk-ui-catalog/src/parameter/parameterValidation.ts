// (C) 2026 GoodData Corporation

import { parse as parseYaml } from "yaml";
import type * as z from "zod/mini";

import type { IParameterMetadataObjectDefinition } from "@gooddata/sdk-model";

import { parameterSchema } from "./parameterSchema.js";

export type ParameterValidationResult =
    | {
          isValid: true;
          parameter: IParameterMetadataObjectDefinition;
      }
    | {
          isValid: false;
          errorCode: ParameterValidationErrorCode;
      };

export type ParameterValidationErrorCode =
    | "empty"
    | "syntax"
    | "invalidStructure"
    | "unsupportedType"
    | "invalidDefaultValue"
    | "invalidConstraints"
    | "invalidConstraintRange"
    | "invalidTags";

export function validateParameterYaml(value: string): ParameterValidationResult {
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
