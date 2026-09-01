// (C) 2026 GoodData Corporation

import { stringify as stringifyYaml } from "yaml";

import type { IParameterDefinition } from "@gooddata/sdk-model";

import type { ParameterSchemaInput } from "./parameterSchema.js";

/** Editor seed: envelope with `definition` widened past the validated subset so any model type displays. */
export type ParameterDraft = Omit<ParameterSchemaInput, "definition"> & {
    definition: IParameterDefinition;
};

/**
 * Serializes a parameter draft to YAML, `id` first.
 *
 * The `id` line is always rendered, empty when the draft has none, so an author who wants to choose
 * the identity has the key waiting; left blank it is dropped on validation and the server derives one
 * on create. An empty `id` renders as `id: ` (a trailing space after the colon) so the next character
 * typed is a YAML scalar, not `id:my_param` which is a syntax error.
 */
export function serializeParameterToYaml(parameter: ParameterDraft): string {
    const { id, ...rest } = parameter;
    const yaml = stringifyYaml({ id: id ?? null, ...rest }, { lineWidth: 0, nullStr: "" }).trimEnd();
    return id ? yaml : yaml.replace(/^id:$/m, "id: ");
}
