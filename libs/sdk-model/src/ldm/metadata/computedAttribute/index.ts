// (C) 2026 GoodData Corporation

import { type IAuditable, type IObjectCertification } from "../../../base/metadata.js";
import { type IAttributeDisplayFormMetadataObject } from "../attributeDisplayForm/index.js";
import { type IDataSetMetadataObject } from "../dataSet/index.js";
import { type MetricType } from "../measure/index.js";
import { type IMetadataObject, type IMetadataObjectDefinition, isMetadataObject } from "../types.js";

/**
 * Data type of the computed attribute values.
 *
 * @public
 */
export type ComputedAttributeDataType =
    | "INT"
    | "STRING"
    | "DATE"
    | "NUMERIC"
    | "TIMESTAMP"
    | "TIMESTAMP_TZ"
    | "BOOLEAN"
    | "HLL";

/**
 * @public
 */
export interface IComputedAttributeMetadataObjectBase {
    type: "computedAttribute";

    /**
     * MAQL expression computing the attribute values.
     */
    expression: string;

    /**
     * Formatting of the computed values.
     * If empty, a backend implementation-dependent default is used.
     */
    format?: string;

    /**
     * Categorizes the semantics of the computed values (e.g., currency).
     */
    metricType?: MetricType;

    /**
     * Data type of the computed values.
     */
    dataType?: ComputedAttributeDataType;

    /**
     * Whether the computed values may contain nulls.
     */
    isNullable?: boolean;

    /**
     * Value used in place of null computed values.
     */
    nullValue?: string;

    /**
     * Locale whose collation order the computed values are sorted by.
     */
    locale?: string;
}

/**
 * Computed attribute metadata object.
 *
 * @remarks
 * A computed attribute is an attribute whose values are computed by a MAQL expression
 * instead of being backed by a data source column. It is deliberately shaped as close
 * to {@link IAttributeMetadataObject} as possible so that UI treats it like a normal
 * attribute wherever it appears (buckets, catalog, ...).
 *
 * @public
 */
export type IComputedAttributeMetadataObject = IMetadataObject &
    IComputedAttributeMetadataObjectBase &
    IAuditable & {
        /**
         * Display forms of the computed attribute.
         *
         * @remarks
         * A computed attribute has no real labels on the backend. To mimic the structure of
         * a normal attribute, the backend implementation fabricates exactly one display form
         * (isDefault and isPrimary, attribute ref pointing to this computed attribute).
         */
        displayForms: IAttributeDisplayFormMetadataObject[];

        /**
         * Whether the computed attribute is locked for editing (e.g. inherited from a parent workspace).
         */
        isLocked?: boolean;

        /**
         * Dataset the computed attribute belongs to (if supplied by backend include).
         */
        dataSet?: IDataSetMetadataObject;

        /**
         * Certification metadata.
         * @internal
         */
        certification?: IObjectCertification;
    };

/**
 * Computed attribute metadata object definition (not yet persisted).
 *
 * @public
 */
export type IComputedAttributeMetadataObjectDefinition = IMetadataObjectDefinition &
    IComputedAttributeMetadataObjectBase;

/**
 * Tests whether the provided object is of type {@link IComputedAttributeMetadataObject}.
 *
 * @param obj - object to test
 * @public
 */
export function isComputedAttributeMetadataObject(obj: unknown): obj is IComputedAttributeMetadataObject {
    return isMetadataObject(obj) && obj.type === "computedAttribute";
}

/**
 * Tests whether the provided object is of type {@link IComputedAttributeMetadataObjectDefinition}.
 *
 * @param obj - object to test
 * @public
 */
export function isComputedAttributeMetadataObjectDefinition(
    obj: unknown,
): obj is IComputedAttributeMetadataObjectDefinition {
    return (
        (obj as IComputedAttributeMetadataObject).type === "computedAttribute" &&
        (obj as IComputedAttributeMetadataObject).ref === undefined
    );
}
