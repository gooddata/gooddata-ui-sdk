// (C) 2026 GoodData Corporation

import { parse as parseYaml } from "yaml";
import type * as z from "zod/mini";

import type { ParameterType } from "@gooddata/sdk-model";

import { type ParameterSchema, buildParameterSchema } from "./parameterSchema.js";

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
    | "unsupportedType"
    | "invalidDefaultValue"
    | "invalidConstraints"
    | "invalidConstraintRange"
    | "invalidTags";

type ValidateParameterYamlOptions = {
    enabledTypes: ParameterType[];
    fixedIdentifier?: string;
};

export function validateParameterYaml(
    value: string,
    options: ValidateParameterYamlOptions,
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

    const result = buildParameterSchema(options.enabledTypes).safeParse(parsed);
    if (!result.success) {
        return classifySchemaError(result.error, readDeclaredType(parsed));
    }

    if (options.fixedIdentifier !== undefined && result.data.id !== options.fixedIdentifier) {
        return invalid("idImmutable");
    }

    return {
        isValid: true,
        parameter: result.data,
    };
}

function classifySchemaError(
    error: z.core.$ZodError,
    declaredType: ParameterType | undefined,
): ParameterValidationResult {
    for (const issue of error.issues) {
        const path = issue.path.map(String).join(".");

        if (issue.code === "custom") {
            if (issue.message === "invalidConstraintRange") {
                return invalid("invalidConstraintRange", declaredType);
            }
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

/** The declared `definition.type`, when it names a known model type; drives the type-specific error copy. */
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

function invalid(code: ParameterValidationErrorCode, type?: ParameterType): ParameterValidationResult {
    return {
        isValid: false,
        errorCode: code,
        type,
    };
}
