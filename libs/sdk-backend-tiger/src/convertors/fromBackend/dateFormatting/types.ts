// (C) 2020 GoodData Corporation
import { CatalogDateAttributeGranularity } from "@gooddata/sdk-model";

export type DateFormatter = (value: Date, granularity: CatalogDateAttributeGranularity) => string;
