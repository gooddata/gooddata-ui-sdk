// (C) 2019-2022 GoodData Corporation
/* eslint-disable @typescript-eslint/no-empty-interface, import/namespace */
import * as m from "@gooddata/sdk-model";

/**
 * Type representing catalog dateDataset date attribute
 * @deprecated Use {@link @gooddata/sdk-model#ICatalogDateAttribute}
 * @public
 */
export interface ICatalogDateAttribute extends m.ICatalogDateAttribute {}

/**
 * Type representing catalog date dataset
 * @deprecated Use {@link @gooddata/sdk-model#ICatalogDateDataset}
 * @public
 */
export interface ICatalogDateDataset extends m.ICatalogDateDataset {}

/**
 * Type guard checking whether object is an instance of ICatalogDateDataset.
 * @deprecated Use {@link @gooddata/sdk-model#isCatalogDateDataset}
 * @public
 */
export const isCatalogDateDataset = m.isCatalogDateDataset;
