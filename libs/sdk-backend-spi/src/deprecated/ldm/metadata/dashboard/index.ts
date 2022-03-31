// (C) 2019-2022 GoodData Corporation
/* eslint-disable @typescript-eslint/no-empty-interface, import/namespace */
import * as m from "@gooddata/sdk-model";

/**
 * Dashboard metadata object
 * @deprecated Use {@link @gooddata/sdk-model#IDashboardMetadataObject}
 * @public
 */
export interface IDashboardMetadataObject extends m.IDashboardMetadataObject {}

/**
 * Tests whether the provided object is of type {@link IDashboardMetadataObject}.
 * @param obj - object to test
 * @deprecated Use {@link @gooddata/sdk-model#isDashboardMetadataObject}
 * @public
 */
export const isDashboardMetadataObject = m.isDashboardMetadataObject;
