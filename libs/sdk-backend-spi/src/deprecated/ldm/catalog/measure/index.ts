// (C) 2019-2022 GoodData Corporation
/* eslint-disable @typescript-eslint/no-empty-interface, import/namespace */
import * as m from "@gooddata/sdk-model";

/**
 * Type representing catalog measure
 * @deprecated Use {@link @gooddata/sdk-model#ICatalogMeasure}
 * @public
 */
export interface ICatalogMeasure extends m.ICatalogMeasure {}

/**
 * Type guard checking whether the provided object is a {@link ICatalogMeasure}
 * @deprecated Use {@link @gooddata/sdk-model#isCatalogMeasure}
 * @public
 */
export const isCatalogMeasure = m.isCatalogMeasure;
