// (C) 2019-2022 GoodData Corporation
/* eslint-disable @typescript-eslint/no-empty-interface, import/namespace */
import * as m from "@gooddata/sdk-model";

/**
 * Attribute display form metadata object
 * @deprecated Use {@link @gooddata/sdk-model#IAttributeDisplayFormMetadataObject}
 * @public
 */
export interface IAttributeDisplayFormMetadataObject extends m.IAttributeDisplayFormMetadataObject {}

/**
 * Gets the attribute display form's ObjRef
 * @param displayForm - attribute display form to work with
 * @returns ObjRef of the attribute display form
 * @deprecated Use {@link @gooddata/sdk-model#attributeDisplayFormRef}
 * @public
 */
export const attributeDisplayFormRef = m.attributeDisplayFormMetadataObjectRef;

/**
 * Gets the attribute display form's title.
 * @param displayForm - attribute display form to work with
 * @returns title of the attribute display form
 * @deprecated Use {@link @gooddata/sdk-model#attributeDisplayFormTitle}
 * @public
 */
export const attributeDisplayFormTitle = m.attributeDisplayFormMetadataObjectTitle;

/**
 * Gets ObjRef of the attribute the display form is a form of.
 *
 * @param displayForm - attribute display form to work with
 * @returns display form ObjRef
 * @deprecated Use {@link @gooddata/sdk-model#attributeDisplayFormAttributeRef}
 * @public
 */
export const attributeDisplayFormAttributeRef = m.attributeDisplayFormMetadataObjectAttributeRef;
/**
 * Tests whether the provided object is of type {@link IAttributeDisplayFormMetadataObject}.
 * @param obj - object to test
 * @deprecated Use {@link @gooddata/sdk-model#isAttributeDisplayFormMetadataObject}
 * @public
 */
export const isAttributeDisplayFormMetadataObject = m.isAttributeDisplayFormMetadataObject;
