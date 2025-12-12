// (C) 2023 GoodData Corporation
import { type IComparison } from "@gooddata/sdk-ui-charts";

export interface IDefaultControlProperties {
    // This can be anything depending on a visualization type
    [property: string]: any;
}

export interface IComparisonControlProperties {
    comparison?: IComparison;
}

export type HeadlineControlProperties = IComparisonControlProperties;
