// (C) 2026 GoodData Corporation

import type { IComputedAttributeMetadataObjectDefinition } from "@gooddata/sdk-model";

import { type YamlValidationFailure, isMaqlWritten, validateYaml } from "../asCode/validateYaml.js";

import { computedAttributeYamlToDefinition } from "./computedAttributeConverter.js";
import { computedAttributeSchema } from "./computedAttributeSchema.js";

export type ComputedAttributeValidationResult =
    | {
          isValid: true;
          computedAttribute: IComputedAttributeMetadataObjectDefinition;
      }
    | YamlValidationFailure<{ errorCode: ComputedAttributeValidationErrorCode }>;

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
        classifyIssue: classifyComputedAttributeIssue,
    });

    if (result.isValid) {
        return { isValid: true, computedAttribute: computedAttributeYamlToDefinition(result.data) };
    }
    return result;
}

function classifyComputedAttributeIssue(
    path: string,
    parsed: unknown,
): { errorCode: ComputedAttributeValidationErrorCode } | undefined {
    if (path === "maql") {
        // A present-but-wrong-typed maql is a structural error, not a missing field.
        return { errorCode: isMaqlWritten(parsed) ? "invalidStructure" : "missingMaql" };
    }
    // A mistyped `type` is easy to make and impossible to spot in a generic structure error,
    // so it gets its own message naming the one value the field accepts.
    if (path === "type") {
        return { errorCode: "invalidType" };
    }
    if (path === "tags" || path.startsWith("tags.")) {
        return { errorCode: "invalidTags" };
    }
    // The value-shaping fields each get a message naming what they accept; a generic structure
    // error would leave the author guessing which of several optional lines is wrong.
    if (path === "locale") {
        return { errorCode: "invalidLocale" };
    }
    if (path === "data_type") {
        return { errorCode: "invalidDataType" };
    }
    if (path === "value_type") {
        return { errorCode: "invalidValueType" };
    }
    if (path === "metric_type") {
        return { errorCode: "invalidMetricType" };
    }
    return undefined;
}
