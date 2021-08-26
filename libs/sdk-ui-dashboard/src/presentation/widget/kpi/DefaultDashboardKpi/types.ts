// (C) 2021 GoodData Corporation
import { IMeasureDescriptor } from "@gooddata/sdk-backend-spi";

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
