// (C) 2021-2022 GoodData Corporation
import { IMeasureDescriptor } from "@gooddata/sdk-model";

export interface IKpiResult {
    measureFormat: string | undefined;
    measureResult: number | undefined;
    measureForComparisonResult?: number;
    measureDescriptor: IMeasureDescriptor | undefined;
}

export interface IKpiAlertResult {
    measureFormat: string | undefined;
    measureResult: number;
}

export type KpiAlertOperationStatus = "idle" | "inProgress" | "error";
