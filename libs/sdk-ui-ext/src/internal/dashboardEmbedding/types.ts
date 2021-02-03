// (C) 2007-2021 GoodData Corporation
import { IMeasureDescriptor } from "@gooddata/sdk-backend-spi";
import {
    IAbsoluteDateFilter,
    IRelativeDateFilter,
    IPositiveAttributeFilter,
    INegativeAttributeFilter,
} from "@gooddata/sdk-model";

export interface IKpiResult {
    measureFormat: string;
    measureResult: number;
    measureForComparisonResult?: number;
    measureDescriptor: IMeasureDescriptor;
}

export interface IKpiAlertResult {
    measureFormat: string;
    measureResult: number;
}

export type KpiAlertOperationStatus = "idle" | "inProgress" | "error";

/**
 * Supported dashboard filter type.
 * @alpha
 */
export type IDashboardFilter =
    | IAbsoluteDateFilter
    | IRelativeDateFilter
    | IPositiveAttributeFilter
    | INegativeAttributeFilter;
