// (C) 2026 GoodData Corporation

import type * as z from "zod/mini";

import type { ParameterType } from "@gooddata/sdk-model";

import { type YamlValidationFailure, validateYaml } from "../asCode/validateYaml.js";

import { type PeriodGranularity, periodGranularities } from "./dateRangePeriod.js";
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
    | YamlValidationFailure<ParameterFailure>;

type ParameterFailure = {
    errorCode: ParameterValidationErrorCode;
    type?: ParameterType;
    /** The period end that `invalidPeriodValue` names, and the granularity it must match. */
    period?: { field: PeriodField; granularity: PeriodGranularity };
};

type PeriodField = "from" | "to";

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
        classifyIssue: classifyParameterIssue,
    });

    if (result.isValid) {
        return { isValid: true, parameter: result.data };
    }
    return result;
}

function classifyParameterIssue(
    path: string,
    parsed: unknown,
    issue: z.core.$ZodIssue,
): ParameterFailure | undefined {
    const declaredType = readDeclaredType(parsed);
    const periodField = readPeriodField(path);
    if (periodField !== undefined && declaredType === "DATE_RANGE") {
        // A wrongly typed end fails before the period rules run, but needs the same message.
        const granularity = readPeriodGranularity(parsed);
        return granularity === undefined
            ? { errorCode: "unsupportedGranularity" }
            : { errorCode: "invalidPeriodValue", period: { field: periodField, granularity } };
    }
    if (isSchemaErrorCode(issue.message)) {
        return { errorCode: issue.message, type: declaredType };
    }
    // The object's own `type`, not the model type inside `definition`. A mistyped one is easy to
    // make and impossible to spot in a generic structure error, so it gets its own message naming
    // the one value the field accepts.
    if (path === "type") {
        return { errorCode: "invalidType" };
    }
    if (path === "definition.type") {
        return { errorCode: "unsupportedType" };
    }
    if (path === "definition.defaultValue") {
        return { errorCode: "invalidDefaultValue", type: declaredType };
    }
    if (path.startsWith("definition.constraints")) {
        return { errorCode: "invalidConstraints", type: declaredType };
    }
    if (path === "tags" || path.startsWith("tags.")) {
        return { errorCode: "invalidTags" };
    }
    return undefined;
}

const schemaErrorCodeSet: ReadonlySet<string> = new Set(schemaErrorCodes);

function isSchemaErrorCode(message: string): message is SchemaErrorCode {
    return schemaErrorCodeSet.has(message);
}

function readDeclaredType(parsed: unknown): ParameterType | undefined {
    const type = readDefinition(parsed)?.["type"];
    return type === "NUMBER" || type === "STRING" || type === "DATE_RANGE" ? type : undefined;
}

function readPeriodGranularity(parsed: unknown): PeriodGranularity | undefined {
    const period = readDefinition(parsed)?.["defaultValue"];
    const granularity = isRecord(period) ? period["granularity"] : undefined;
    return periodGranularities.find((candidate) => candidate === granularity);
}

function readPeriodField(path: string): PeriodField | undefined {
    if (path === "definition.defaultValue.from") {
        return "from";
    }
    return path === "definition.defaultValue.to" ? "to" : undefined;
}

function readDefinition(parsed: unknown): Record<string, unknown> | undefined {
    const definition = isRecord(parsed) ? parsed["definition"] : undefined;
    return isRecord(definition) ? definition : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
}
