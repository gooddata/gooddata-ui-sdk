// (C) 2019-2022 GoodData Corporation
/* eslint-disable @typescript-eslint/no-empty-interface, import/namespace */
import * as m from "@gooddata/sdk-model";

/**
 * Fact metadata object
 * @deprecated Use {@link @gooddata/sdk-model#IFactMetadataObject}
 * @public
 */
export interface IFactMetadataObject extends m.IFactMetadataObject {}

/**
 * Tests whether the provided object is of type {@link IFactMetadataObject}.
 * @param obj - object to test
 * @deprecated Use {@link @gooddata/sdk-model#isFactMetadataObject}
 * @public
 */
export const isFactMetadataObject = m.isFactMetadataObject;
