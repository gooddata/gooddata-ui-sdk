// (C) 2007-2018 GoodData Corporation
import { ISeparators } from '@gooddata/numberjs';

export interface IMenu {
    aggregations?: boolean;
}

// Not all total types are supported by pivot table menu, for example "nat" (total rollup)
// type is not supported at the moment.
export type PivotTableMenuTotalType = 'sum' | 'avg' | 'max' | 'min' | 'med';

export interface IPivotTableConfig {
    separators?: ISeparators;
    menu?: IMenu;
}

export interface IMenuAggregationClickConfig {
    type: PivotTableMenuTotalType;
    measureIdentifiers: string[];
    attributeIdentifier: string;
    include: boolean;
}
