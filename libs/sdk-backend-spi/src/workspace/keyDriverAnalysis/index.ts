// (C) 2019-2025 GoodData Corporation

import { DateAttributeGranularity, IAttribute, IFilter, IMeasure, ObjRef } from "@gooddata/sdk-model";

/**
 * @internal
 */
export interface IChangeAnalysisResults {
    /**
     * List of all key drivers
     */
    keyDrivers: IKeyDriver[];
}

/**
 * @internal
 *
 * Key driver definition
 */
export interface IKeyDriver {
    /**
     * Display form of the key driver (label, attribute)
     */
    displayForm: ObjRef;
    /**
     * Key driver attribute / label value
     */
    value: string;
    /**
     * Metric value in analyzed and reference period
     */
    metricValue: {
        /**
         * Analyzed period metric value
         */
        from: number;
        /**
         * Reference period metric value
         */
        to: number;
        /**
         * Delta between analyzed and reference period metric values
         */
        delta: number;
    };
    /**
     * Standard deviation of the metric value
     */
    std: number;
    /**
     * Mean of the metric value
     */
    mean: number;
    /**
     * Is the change significant
     */
    isSignificantChange: boolean;
}

/**
 * @internal
 *
 * Change analysis period definition
 */
export interface IChangeAnalysisPeriod {
    /**
     * Date attribute reference
     */
    dateAttribute: IAttribute;
    /**
     * Granularity for date attribute, its necessary for date conversion
     */
    granularity: DateAttributeGranularity;
    /**
     * From date - ISO date format
     */
    from: string;
    /**
     * To date - ISO date format
     */
    to: string;
}

/**
 * @internal
 *
 * Change analysis period definition
 */
export interface IChangeAnalysisDefinition {
    /**
     * Analyzed measure definition
     */
    measure: IMeasure;
    /**
     * All related measures to analyzed measure
     */
    auxMeasures?: IMeasure[];
    /**
     * All attributes to run analysis for
     */
    attributes?: IAttribute[];
    /**
     * All applied filters
     */
    filters?: IFilter[];
}

/**
 * Service for key drivers analysis
 *
 * @internal
 */
export interface IWorkspaceKeyDriverAnalysisService {
    /**
     * Compute change analysis
     */
    computeChangeAnalysis(
        definition: IChangeAnalysisDefinition,
        period: IChangeAnalysisPeriod,
    ): Promise<IChangeAnalysisResults>;
}
