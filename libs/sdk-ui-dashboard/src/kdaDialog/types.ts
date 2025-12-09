// (C) 2025 GoodData Corporation

import { IAttributeDescriptorBody, IDashboardAttributeFilter, IMeasure, ObjRef } from "@gooddata/sdk-model";

/**
 * @internal
 */
export interface IKdaDialogProps {
    /**
     * Locale for the dialog
     */
    locale?: string;
    /**
     * CSS class name for the dialog
     */
    className?: string;

    /**
     * Whether to show the close button
     */
    showCloseButton?: boolean;

    /**
     * Custom close button handler
     */
    onClose?: () => void;
}

/**
 * @internal
 */
export interface IKdaDataPoint {
    /**
     * Date string in ISO format related to granularity
     */
    date: string;
    /**
     * Valuer of metric for given range
     */
    value: number | undefined;
    /**
     * Format of date attribute
     */
    format?: IAttributeDescriptorBody["format"];
}

/**
 * @internal
 */
export interface IKdaDefinition {
    /**
     * Metric to analyze
     */
    metric: IMeasure;
    /**
     * Metrics related to main metric
     */
    metrics?: IMeasure[];
    /**
     * Filters to apply
     */
    filters?: IDashboardAttributeFilter[];
    /**
     * Date attribute
     */
    dateAttribute: ObjRef;
    /**
     * Type of period
     */
    type: KdaPeriodType;
    /**
     * Ranges
     */
    range: [IKdaDataPoint, IKdaDataPoint];
}

/**
 * @internal
 */
export type KdaPeriodType = "same_period_previous_year" | "previous_period";

/**
 * @internal
 */
export type DeepReadonly<T> = T extends (infer R)[]
    ? ReadonlyArray<DeepReadonly<R>>
    : // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
      T extends Function
      ? T
      : T extends object
        ? DeepReadonlyObject<T>
        : T;

/**
 * @internal
 */
export type DeepReadonlyObject<T> = {
    readonly [P in keyof T]: DeepReadonly<T[P]>;
};
