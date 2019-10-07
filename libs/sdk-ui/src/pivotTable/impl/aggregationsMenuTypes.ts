// (C) 2007-2019 GoodData Corporation
import { TotalType } from "@gooddata/sdk-model";

export interface IColumnTotal {
    type: TotalType;
    attributes: string[];
}
