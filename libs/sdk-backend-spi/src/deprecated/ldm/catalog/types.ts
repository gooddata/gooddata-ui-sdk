// (C) 2019-2022 GoodData Corporation
/* eslint-disable @typescript-eslint/no-empty-interface, import/namespace */
import * as m from "@gooddata/sdk-model";

/**
 * Type representing catalog item type - attribute, measure, fact or dateDataset
 * @deprecated Use {@link @gooddata/sdk-model#CatalogItemType}
 * @public
 */
export type CatalogItemType = m.CatalogItemType;

/**
 * Properties contained in each catalog item
 * @deprecated Use {@link @gooddata/sdk-model#ICatalogItemBase}
 * @public
 */
export interface ICatalogItemBase extends m.ICatalogItemBase {}
