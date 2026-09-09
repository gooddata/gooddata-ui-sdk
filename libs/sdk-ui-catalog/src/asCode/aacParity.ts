// (C) 2026 GoodData Corporation

import type { v1 } from "@gooddata/sdk-code-schemas";

import type { ObjectTypes } from "../objectType/constants.js";

/**
 * The analytics-as-code (AAC) document type each as-code editor mirrors, keyed by catalog object type.
 * Register a type here when its editor gets a YAML schema; `AacSchemaParity` then knows what to
 * compare that schema against.
 */
export type AacShapeByObjectType = {
    [ObjectTypes.METRIC]: v1.Metric;
    [ObjectTypes.PARAMETER]: v1.Parameter;
    [ObjectTypes.COMPUTED_ATTRIBUTE]: v1.ComputedAttribute;
};

/**
 * Compile-time parity between an as-code editor's zod shape and the AAC document type it mirrors.
 *
 * Resolves to `true` when the two agree, otherwise to an object naming what drifted: a key the AAC
 * schema has but the editor does not (`aacKeysMissingInEditor`), a key the editor accepts that AAC
 * does not know (`editorKeysUnknownToAac`), or, in the default `"shape"` mode, editor values that do
 * not fit the AAC type. Pass `"keys"` for an editor that deliberately accepts values AAC cannot express
 * yet, so only the key set is compared. Declare it once next to the schema through
 * {@link AssertAacParity}, which turns a drift into a build error, for example
 * `Type '{ aacKeysMissingInEditor: "sort_direction"; }' does not satisfy the constraint 'true'`.
 *
 * The AAC type comes from `@gooddata/sdk-code-schemas`, generated from the JSON Schema and gated by
 * its `schema-check`, so a field added to `schemas/v1/src/*.json` reaches this guard through the
 * regenerated type once the schemas package is rebuilt.
 */
export type AacSchemaParity<
    TObjectType extends keyof AacShapeByObjectType,
    TEditorShape,
    TMode extends "shape" | "keys" = "shape",
> = [Exclude<keyof AacShapeByObjectType[TObjectType], keyof TEditorShape>] extends [never]
    ? [Exclude<keyof TEditorShape, keyof AacShapeByObjectType[TObjectType]>] extends [never]
        ? TMode extends "keys"
            ? true
            : TEditorShape extends Omit<AacShapeByObjectType[TObjectType], "id">
              ? true
              : { editorValuesDoNotFitAac: true }
        : { editorKeysUnknownToAac: Exclude<keyof TEditorShape, keyof AacShapeByObjectType[TObjectType]> }
    : { aacKeysMissingInEditor: Exclude<keyof AacShapeByObjectType[TObjectType], keyof TEditorShape> };

/**
 * Fails the build unless the parity resolved to `true`:
 * `export type MetricAacParity = AssertAacParity<AacSchemaParity<typeof ObjectTypes.METRIC, MetricSchema>>;`
 */
export type AssertAacParity<TParity extends true> = TParity;
