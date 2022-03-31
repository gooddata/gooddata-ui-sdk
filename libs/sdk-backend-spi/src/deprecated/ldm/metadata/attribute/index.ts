// (C) 2019-2022 GoodData Corporation
/* eslint-disable @typescript-eslint/no-empty-interface, import/namespace */
import * as m from "@gooddata/sdk-model";

/**
 * Attribute metadata object
 * @deprecated Use {@link @gooddata/sdk-model#IAttributeMetadataObject}
 * @public
 */
export interface IAttributeMetadataObject extends m.IAttributeMetadataObject {}

/**
 * Tests whether the provided object is of type {@link IAttributeMetadataObject}.
 *
 * @param obj - object to test
 * @deprecated Use {@link @gooddata/sdk-model#isAttributeMetadataObject}
 * @public
 */
export const isAttributeMetadataObject = m.isAttributeMetadataObject;
