// (C) 2023-2026 GoodData Corporation

import { isCatalogAttributeHierarchy, isCatalogDateDataset } from "@gooddata/sdk-model";
import { combineGuards } from "@gooddata/util";

export const isNonGroupableCatalogItem = combineGuards(isCatalogDateDataset, isCatalogAttributeHierarchy);
