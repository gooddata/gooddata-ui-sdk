// (C) 2022-2026 GoodData Corporation

import { type MetricType } from "@gooddata/sdk-model";

import { type EmptyMetricWidthId } from "../metric/emptyMetric.js";

import { type IMeasureDefWithMaqlField } from "./maqlFieldFunctions.js";

/**
 * @internal
 */
export enum FormField {
    id = "id",
    title = "title",
    description = "description",
    expression = "expression",
    format = "format",
    metricType = "metricType",
    prefix = "prefix",
    tags = "tags",
}

export type ValidationSpecialInfo = {
    isMaqlEmpty: boolean;
    isEmpty: boolean;
};

export type FormMetric = Omit<EmptyMetricWidthId, "expression" | "format"> &
    Pick<IMeasureDefWithMaqlField, "expression"> & {
        prefix?: string;
        metricType?: MetricType;
        format?: string | null;
    };
