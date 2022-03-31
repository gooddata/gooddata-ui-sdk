// (C) 2019-2022 GoodData Corporation
/* eslint-disable @typescript-eslint/no-empty-interface, import/namespace */
import * as m from "@gooddata/sdk-model";

/**
 * Type representing catalog attribute
 * @deprecated Use {@link @gooddata/sdk-model#ICatalogAttribute}
 * @public
 */
export interface ICatalogAttribute extends m.ICatalogAttribute {}

/**
 * Type guard checking whether the provided object is a {@link ICatalogAttribute}
 * @deprecated Use {@link @gooddata/sdk-model#isCatalogAttribute}
 * @public
 */
export const isCatalogAttribute = m.isCatalogAttribute;
