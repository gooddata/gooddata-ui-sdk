// (C) 2026 GoodData Corporation

import { parse as parseYaml } from "yaml";
import type * as z from "zod/mini";

import type { IMeasureMetadataObjectDefinition } from "@gooddata/sdk-model";

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
    if (value.trim() === "") {
        return invalid("empty");
    }

    let parsed: unknown;
    try {
        parsed = parseYaml(value, { strict: true });
    } catch {
        return invalid("syntax");
    }

    const result = metricSchema.safeParse(parsed);
    if (!result.success) {
        return classifySchemaError(result.error, parsed);
    }

    if (options.fixedIdentifier !== undefined && result.data.id !== options.fixedIdentifier) {
        return invalid("idImmutable");
    }

    return {
        isValid: true,
        measure: metricYamlToDefinition(result.data),
    };
}

function classifySchemaError(error: z.core.$ZodError, parsed: unknown): MetricValidationResult {
    const maqlProvided =
        typeof parsed === "object" && parsed !== null && (parsed as { maql?: unknown }).maql !== undefined;

    for (const issue of error.issues) {
        const path = issue.path.map(String).join(".");

        if (path === "maql") {
            // A present-but-wrong-typed maql is a structural error, not a missing field.
            return invalid(maqlProvided ? "invalidStructure" : "missingMaql");
        }
        if (path === "tags" || path.startsWith("tags.")) {
            return invalid("invalidTags");
        }
    }

    return invalid("invalidStructure");
}

function invalid(code: MetricValidationErrorCode): MetricValidationResult {
    return {
        isValid: false,
        errorCode: code,
    };
}
