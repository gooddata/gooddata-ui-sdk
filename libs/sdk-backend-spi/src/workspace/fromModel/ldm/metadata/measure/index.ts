// (C) 2019-2021 GoodData Corporation
import { IMetadataObject, IMetadataObjectBase, isMetadataObject } from "../types";
import { IInsight } from "@gooddata/sdk-model";

/**
 * @internal
 */
export interface IMeasureMetadataObjectBase {
    type: "measure";

    /**
     * Measure MAQL expression
     */
    expression: string;

    /**
     * Measure formatting
     * Prefer set format value, if the format is empty string backend implementation-dependent default will be used.
     */
    format: string;

    /**
     * Measure is locked for editing
     */
    isLocked?: boolean;
}

/**
 * @internal
 */
export interface IMetadataObjectDefinition
    extends Partial<IMetadataObjectBase>,
        Partial<Pick<IMetadataObject, "id">> {}

/**
 * Measure metadata object
 *
 * @public
 */
export type IMeasureMetadataObject = IMetadataObject & IMeasureMetadataObjectBase;

/**
 * Measure metadata object definition
 *
 * @public
 */
export type IMeasureMetadataObjectDefinition = IMetadataObjectDefinition & IMeasureMetadataObjectBase;

/**
 * Contains information about objects that may be referencing an measure. {@link IWorkspaceMeasuresService.getMeasureReferencingObjects} function.
 *
 * @public
 */
export interface IMeasureReferencing {
    measures?: IMetadataObject[];
    insights?: IInsight[];
}

/**
 * Tests whether the provided object is of type {@link IMeasureMetadataObject}.
 *
 * @param obj - object to test
 * @public
 */
export function isMeasureMetadataObject(obj: unknown): obj is IMeasureMetadataObject {
    return isMetadataObject(obj) && obj.type === "measure";
}

/**
 * Tests whether the provided object is of type {@link IMeasureMetadataObjectDefinition}.
 *
 * @param obj - object to test
 * @public
 */
export function isMeasureMetadataObjectDefinition(obj: unknown): obj is IMeasureMetadataObjectDefinition {
    return (obj as IMetadataObject).type === "measure" && (obj as IMetadataObject).ref === undefined;
}
