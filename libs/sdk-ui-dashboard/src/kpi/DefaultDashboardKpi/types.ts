// (C) 2021 GoodData Corporation
import { IMeasureDescriptor } from "@gooddata/sdk-backend-spi";

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
