// (C) 2007-2018 GoodData Corporation
import { AFM } from "@gooddata/gd-bear-model";

export interface IDataSourceParams {
    uri: string;
    attributeFilters?: AFM.AttributeFilterItem[];
    dateFilter?: AFM.DateFilterItem;
}
