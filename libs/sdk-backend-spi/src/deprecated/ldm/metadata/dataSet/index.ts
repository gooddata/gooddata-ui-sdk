// (C) 2019-2022 GoodData Corporation
/* eslint-disable @typescript-eslint/no-empty-interface, import/namespace */
import * as m from "@gooddata/sdk-model";

/**
 * DataSet metadata object
 * @deprecated Use {@link @gooddata/sdk-model#IDataSetMetadataObject}
 * @public
 */
export interface IDataSetMetadataObject extends m.IDataSetMetadataObject {}

/**
 * Tests whether the provided object is of type {@link IDataSetMetadataObject}.
 * @param obj - object to test
 * @deprecated Use {@link @gooddata/sdk-model#isDataSetMetadataObject}
 * @public
 */
export const isDataSetMetadataObject = m.isDataSetMetadataObject;
