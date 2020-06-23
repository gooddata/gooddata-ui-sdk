// (C) 2020 GoodData Corporation
import { GdcMetadata } from "../meta/GdcMetadata";
import { GdcExtendedDateFilters } from "../extendedDateFilters/GdcExtendedDateFilters";
import isEmpty from "lodash/isEmpty";

/**
 * @public
 */
export namespace GdcKpi {
    export interface IKPI {
        meta: GdcMetadata.IObjectMeta;
        content: IKpiContentWithoutComparison | IKpiContentWithComparison;
    }

    export interface IWrappedKPI {
        kpi: IKPI;
    }

    export interface IKpiContentBase {
        metric: string;
        ignoreDashboardFilters: Array<
            GdcExtendedDateFilters.IDateFilterReference | GdcExtendedDateFilters.IAttributeFilterReference
        >;
        drillTo?: IKpiProjectDashboardLink;
        dateDimension?: string;
        dateDataSet?: string;
    }

    export interface IKpiContentWithComparison extends IKpiContentBase {
        comparisonType: IKpiComparisonTypeComparison;
        comparisonDirection: IKpiComparisonDirection;
    }

    export interface IKpiContentWithoutComparison extends IKpiContentBase {
        comparisonType: IKpiComparisonTypeNoComparison;
    }

    export function isKpiContentWithoutComparison(obj: any): obj is IKpiContentWithoutComparison {
        return !isEmpty(obj) && (obj as IKpiContentWithoutComparison).comparisonType === "none";
    }

    export interface IKpiProjectDashboardLink {
        projectDashboard: string;
        projectDashboardTab: string;
    }

    export type IKpiComparisonTypeNoComparison = "none";
    export type IKpiComparisonTypeComparison = "previousPeriod" | "lastYear";
    export type IKpiComparisonDirection = "growIsGood" | "growIsBad";

    export function isKpi(obj: any): obj is IKPI {
        return !isEmpty(obj) && (obj as IKPI).meta.category === "kpi";
    }

    export function isWrappedKpi(obj: any): obj is IWrappedKPI {
        return !isEmpty(obj) && !!(obj as IWrappedKPI).kpi;
    }
}
