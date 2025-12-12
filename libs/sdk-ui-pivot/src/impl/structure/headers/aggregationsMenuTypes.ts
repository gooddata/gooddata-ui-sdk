// (C) 2007-2019 GoodData Corporation
import { type TotalType } from "@gooddata/sdk-model";

export interface IColumnTotal {
    type: TotalType;
    attributes: string[];
}

export interface IRowTotal {
    type: TotalType;
    attributes: string[];
}
