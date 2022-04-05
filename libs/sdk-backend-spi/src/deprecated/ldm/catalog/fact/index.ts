// (C) 2019-2022 GoodData Corporation
/* eslint-disable @typescript-eslint/no-empty-interface, import/namespace */
import * as m from "@gooddata/sdk-model";

/**
 * Type representing catalog fact
 * @deprecated Use {@link @gooddata/sdk-model#ICatalogFact}
 * @public
 */
export interface ICatalogFact extends m.ICatalogFact {}

/**
 * Type guard checking whether the provided object is a {@link ICatalogFact}
 * @deprecated Use {@link @gooddata/sdk-model#isCatalogFact}
 * @public
 */
export const isCatalogFact = m.isCatalogFact;
