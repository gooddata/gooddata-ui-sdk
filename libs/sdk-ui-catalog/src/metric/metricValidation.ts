// (C) 2026 GoodData Corporation

import type { IMeasureMetadataObjectDefinition } from "@gooddata/sdk-model";

import { type YamlValidationFailure, isMaqlWritten, validateYaml } from "../asCode/validateYaml.js";

import { metricYamlToDefinition } from "./metricConverter.js";
import { metricSchema } from "./metricSchema.js";

export type MetricValidationResult =
    | {
          isValid: true;
          measure: IMeasureMetadataObjectDefinition;
      }
    | YamlValidationFailure<{ errorCode: MetricValidationErrorCode }>;

export type MetricValidationErrorCode =
    | "empty"
    | "syntax"
    | "invalidStructure"
    | "idImmutable"
    | "missingMaql"
    | "invalidTags";

type ValidateMetricYamlOptions = {
    fixedIdentifier?: string;
};

export function validateMetricYaml(
    value: string,
    options: ValidateMetricYamlOptions = {},
): MetricValidationResult {
    const result = validateYaml(value, {
        schema: metricSchema,
        fixedIdentifier: options.fixedIdentifier,
        classifyIssue: classifyMetricIssue,
    });

    if (result.isValid) {
        return { isValid: true, measure: metricYamlToDefinition(result.data) };
    }
    return result;
}

function classifyMetricIssue(
    path: string,
    parsed: unknown,
): { errorCode: MetricValidationErrorCode } | undefined {
    if (path === "maql") {
        // A present-but-wrong-typed maql is a structural error, not a missing field.
        return { errorCode: isMaqlWritten(parsed) ? "invalidStructure" : "missingMaql" };
    }
    if (path === "tags" || path.startsWith("tags.")) {
        return { errorCode: "invalidTags" };
    }
    return undefined;
}
