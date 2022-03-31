// (C) 2020-2022 GoodData Corporation
/* eslint-disable @typescript-eslint/no-empty-interface, import/namespace */
import * as m from "@gooddata/sdk-model";

/**
 * Variable metadata object
 * @deprecated Use {@link @gooddata/sdk-model#IVariableMetadataObject}
 * @public
 */
export interface IVariableMetadataObject extends m.IVariableMetadataObject {}

/**
 * Tests whether the provided object is of type {@link IVariableMetadataObject}.
 * @param obj - object to test
 * @deprecated Use {@link @gooddata/sdk-model#isVariableMetadataObject}
 * @public
 */
export const isVariableMetadataObject = m.isVariableMetadataObject;
