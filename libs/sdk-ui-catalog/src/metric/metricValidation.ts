// (C) 2026 GoodData Corporation

import type * as z from "zod/mini";

import type { IMeasureMetadataObjectDefinition } from "@gooddata/sdk-model";

import { validateYaml } from "../asCode/validateYaml.js";

import { metricYamlToDefinition } from "./metricConverter.js";
import { metricSchema } from "./metricSchema.js";

export type MetricValidationResult =
    | {
          isValid: true;
          measure: IMeasureMetadataObjectDefinition;
      }
    | {
          isValid: false;
          errorCode: MetricValidationErrorCode;
      };

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
        classifyError: classifyMetricError,
    });

    return result.ok
        ? { isValid: true, measure: metricYamlToDefinition(result.data) }
        : { isValid: false, errorCode: result.errorCode };
}

function classifyMetricError(
    error: z.core.$ZodError,
    parsed: unknown,
): "invalidStructure" | "missingMaql" | "invalidTags" {
    const maqlProvided =
        typeof parsed === "object" && parsed !== null && (parsed as { maql?: unknown }).maql !== undefined;

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
