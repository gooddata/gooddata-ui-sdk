// (C) 2020-2022 GoodData Corporation
import {
    IAttributeFilterReference,
    IDateFilterReference,
} from "../extendedDateFilters/GdcExtendedDateFilters.js";
import { IObjectMeta } from "../meta/GdcMetadata.js";
import isEmpty from "lodash/isEmpty.js";

/**
 * @public
 */
export interface IKPI {
    meta: IObjectMeta;
    content: IKpiContentWithoutComparison | IKpiContentWithComparison;
}

/**
 * @public
 */
export interface IWrappedKPI {
    kpi: IKPI;
}

/**
 * @public
 */
export interface IKpiContentBase {
    metric: string;
    ignoreDashboardFilters: Array<IDateFilterReference | IAttributeFilterReference>;
    drillTo?: IKpiProjectDashboardLink;
    dateDimension?: string;
    dateDataSet?: string;
    configuration?: IKpiConfiguration;
}

/**
 * @public
 */
export interface IKpiConfiguration {
    description?: IKpiDescriptionConfiguration;
}

/**
 * @public
 */
export interface IKpiDescriptionConfiguration {
    /**
     * Whether description should be visible or not
     */
    visible: boolean;
    /**
     * Whether description should be used from kpi or inherited from its metric
     */
    source: KpiDescriptionSourceType;
}

/**
 * @public
 */
export type KpiDescriptionSourceType = "kpi" | "metric";

/**
 * @public
 */
export interface IKpiContentWithComparison extends IKpiContentBase {
    comparisonType: IKpiComparisonTypeComparison;
    comparisonDirection: IKpiComparisonDirection;
}

/**
 * @public
 */
export interface IKpiContentWithoutComparison extends IKpiContentBase {
    comparisonType: IKpiComparisonTypeNoComparison;
}

/**
 * @public
 */
export function isKpiContentWithoutComparison(obj: unknown): obj is IKpiContentWithoutComparison {
    return !isEmpty(obj) && (obj as IKpiContentWithoutComparison).comparisonType === "none";
}

/**
 * @public
 */
export interface IKpiProjectDashboardLink {
    projectDashboard: string;
    projectDashboardTab: string;
}

/**
 * @public
 */
export type IKpiComparisonTypeNoComparison = "none";

/**
 * @public
 */
export type IKpiComparisonTypeComparison = "previousPeriod" | "lastYear";

/**
 * @public
 */
export type IKpiComparisonDirection = "growIsGood" | "growIsBad";

/**
 * @public
 */
export function isKpi(obj: unknown): obj is IKPI {
    return !isEmpty(obj) && (obj as IKPI).meta.category === "kpi";
}

/**
 * @public
 */
export function isWrappedKpi(obj: unknown): obj is IWrappedKPI {
    return !isEmpty(obj) && !!(obj as IWrappedKPI).kpi;
}
