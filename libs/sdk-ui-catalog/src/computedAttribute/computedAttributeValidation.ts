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
    | "invalidTags";

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
): "invalidStructure" | "missingMaql" | "invalidTags" {
    // A blank `maql:` line parses to null - the seeded template's state - and counts as unwritten,
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
        if (path === "tags" || path.startsWith("tags.")) {
            return "invalidTags";
        }
    }

    return "invalidStructure";
}
