// (C) 2020 GoodData Corporation
import { DateAttributeGranularity } from "@gooddata/sdk-model";

export type DateFormatter = (value: Date, granularity: DateAttributeGranularity) => string;
