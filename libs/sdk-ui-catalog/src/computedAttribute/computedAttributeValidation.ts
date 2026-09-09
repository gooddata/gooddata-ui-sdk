// (C) 2026 GoodData Corporation

import type * as z from "zod/mini";

import type { IComputedAttributeMetadataObjectDefinition } from "@gooddata/sdk-model";

import { validateYaml } from "../asCode/validateYaml.js";

import { computedAttributeYamlToDefinition } from "./computedAttributeConverter.js";
import { computedAttributeSchema } from "./computedAttributeSchema.js";

export type ComputedAttributeValidationResult =
    | {
          isValid: true;
          computedAttribute: IComputedAttributeMetadataObjectDefinition;
      }
    | {
          isValid: false;
          errorCode: ComputedAttributeValidationErrorCode;
      };

export type ComputedAttributeValidationErrorCode =
    | "empty"
    | "syntax"
    | "invalidStructure"
    | "idImmutable"
    | "missingMaql"
    | "invalidType"
    | "invalidTags"
    | "invalidLocale"
    | "invalidDataType"
    | "invalidValueType"
    | "invalidMetricType";

type ValidateComputedAttributeYamlOptions = {
    fixedIdentifier?: string;
};

export function validateComputedAttributeYaml(
    value: string,
    options: ValidateComputedAttributeYamlOptions = {},
): ComputedAttributeValidationResult {
    const result = validateYaml(value, {
        schema: computedAttributeSchema,
        fixedIdentifier: options.fixedIdentifier,
    });

    if (result.ok) {
        return { isValid: true, computedAttribute: computedAttributeYamlToDefinition(result.data) };
    }
    return {
        isValid: false,
        errorCode:
            result.kind === "schema"
                ? classifyComputedAttributeError(result.error, result.parsed)
                : result.kind,
    };
}

function classifyComputedAttributeError(
    error: z.core.$ZodError,
    parsed: unknown,
): Exclude<ComputedAttributeValidationErrorCode, "empty" | "syntax" | "idImmutable"> {
    // A blank `maql:` / `maql: ` line parses to null - the seeded template's state - and counts as unwritten,
    // not as a value of the wrong type.
    const maqlProvided =
        typeof parsed === "object" &&
        parsed !== null &&
        ((parsed as { maql?: unknown }).maql ?? undefined) !== undefined;

    for (const issue of error.issues) {
        const path = issue.path.map(String).join(".");

        if (path === "maql") {
            // A present-but-wrong-typed maql is a structural error, not a missing field.
            return maqlProvided ? "invalidStructure" : "missingMaql";
        }
        // A mistyped `type` is easy to make and impossible to spot in a generic structure error,
        // so it gets its own message naming the one value the field accepts.
        if (path === "type") {
            return "invalidType";
        }
        if (path === "tags" || path.startsWith("tags.")) {
            return "invalidTags";
        }
        // The value-shaping fields each get a message naming what they accept; a generic structure
        // error would leave the author guessing which of several optional lines is wrong.
        if (path === "locale") {
            return "invalidLocale";
        }
        if (path === "data_type") {
            return "invalidDataType";
        }
        if (path === "value_type") {
            return "invalidValueType";
        }
        if (path === "metric_type") {
            return "invalidMetricType";
        }
    }

    return "invalidStructure";
}
