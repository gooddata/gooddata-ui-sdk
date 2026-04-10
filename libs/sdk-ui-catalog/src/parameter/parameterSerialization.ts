// (C) 2026 GoodData Corporation

import { stringify as stringifyYaml } from "yaml";

import type { ParameterSchemaInput } from "./parameterSchema.js";

export function serializeParameterToYaml(parameter: ParameterSchemaInput): string {
    return stringifyYaml(parameter, { lineWidth: 0 }).trimEnd();
}
