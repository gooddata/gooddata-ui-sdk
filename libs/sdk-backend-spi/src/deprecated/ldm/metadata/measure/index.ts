// (C) 2019-2022 GoodData Corporation
/* eslint-disable @typescript-eslint/no-empty-interface, import/namespace */
import * as m from "@gooddata/sdk-model";

/**
 * @deprecated Use {@link @gooddata/sdk-model#IMeasureMetadataObjectBase}
 * @internal
 */
export interface IMeasureMetadataObjectBase extends m.IMeasureMetadataObjectBase {}

/**
 * @deprecated Use {@link @gooddata/sdk-model#IMetadataObjectDefinition}
 * @internal
 */
export interface IMetadataObjectDefinition extends m.IMetadataObjectDefinition {}

/**
 * Measure metadata object
 * @deprecated Use {@link @gooddata/sdk-model#IMeasureMetadataObject}
 * @public
 */
export type IMeasureMetadataObject = m.IMeasureMetadataObject;

/**
 * Measure metadata object definition
 * @deprecated Use {@link @gooddata/sdk-model#IMeasureMetadataObjectDefinition}
 * @public
 */
export type IMeasureMetadataObjectDefinition = m.IMeasureMetadataObjectDefinition;

/**
 * Tests whether the provided object is of type {@link IMeasureMetadataObject}.
 * @deprecated Use {@link @gooddata/sdk-model#isMeasureMetadataObject}
 * @param obj - object to test
 * @public
 */
export const isMeasureMetadataObject = m.isMeasureMetadataObject;

/**
 * Tests whether the provided object is of type {@link IMeasureMetadataObjectDefinition}.
 * @deprecated Use {@link @gooddata/sdk-model#isMeasureMetadataObjectDefinition}
 * @param obj - object to test
 * @public
 */
export const isMeasureMetadataObjectDefinition = m.isMeasureMetadataObjectDefinition;
