// (C) 2020-2022 GoodData Corporation
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
        configuration?: IKpiConfiguration;
    }

    export interface IKpiConfiguration {
        description?: IKpiDescriptionConfiguration;
    }

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

    export type KpiDescriptionSourceType = "kpi" | "metric";

    export interface IKpiContentWithComparison extends IKpiContentBase {
        comparisonType: IKpiComparisonTypeComparison;
        comparisonDirection: IKpiComparisonDirection;
    }

    export interface IKpiContentWithoutComparison extends IKpiContentBase {
        comparisonType: IKpiComparisonTypeNoComparison;
    }

    export function isKpiContentWithoutComparison(obj: unknown): obj is IKpiContentWithoutComparison {
        return !isEmpty(obj) && (obj as IKpiContentWithoutComparison).comparisonType === "none";
    }

    export interface IKpiProjectDashboardLink {
        projectDashboard: string;
        projectDashboardTab: string;
    }

    export type IKpiComparisonTypeNoComparison = "none";
    export type IKpiComparisonTypeComparison = "previousPeriod" | "lastYear";
    export type IKpiComparisonDirection = "growIsGood" | "growIsBad";

    export function isKpi(obj: unknown): obj is IKPI {
        return !isEmpty(obj) && (obj as IKPI).meta.category === "kpi";
    }

    export function isWrappedKpi(obj: unknown): obj is IWrappedKPI {
        return !isEmpty(obj) && !!(obj as IWrappedKPI).kpi;
    }
}
