// (C) 2026 GoodData Corporation

import { stringify as stringifyYaml } from "yaml";

import type { IParameterDefinition } from "@gooddata/sdk-model";

import type { ParameterSchemaInput } from "./parameterSchema.js";

/** Editor seed: envelope with `definition` widened past the validated subset so any model type displays. */
export type ParameterDraft = Omit<ParameterSchemaInput, "definition"> & {
    definition: IParameterDefinition;
};

export function serializeParameterToYaml(parameter: ParameterDraft): string {
    return stringifyYaml(parameter, { lineWidth: 0 }).trimEnd();
}
