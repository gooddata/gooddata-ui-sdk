// (C) 2019-2020 GoodData Corporation

import {
    IVisualizationClass,
    IInsight,
    IAttributeDisplayForm,
    IMeasureExpressionToken,
    IInsightDefinition,
} from "@gooddata/sdk-model";
import { IPagedResource } from "../../common/paging";

/**
 * TODO: SDK8: add public doc
 *
 * @public
 */
export interface IWorkspaceMetadata {
    getVisualizationClass(id: string): Promise<IVisualizationClass>;
    getVisualizationClasses(): Promise<IVisualizationClass[]>;
    getInsight(id: string): Promise<IInsight>;
    getInsights(options?: IInsightQueryOptions): Promise<IInsightQueryResult>;
    createInsight(insight: IInsightDefinition): Promise<IInsight>;
    updateInsight(insight: IInsight): Promise<IInsight>;
    deleteInsight(id: string): Promise<void>;
    /**
     * Gets the attribute display form with the provided identifier.
     * @param id - identifier of the attribute display form to retrieve
     * @public
     */
    getAttributeDisplayForm(id: string): Promise<IAttributeDisplayForm>;

    /**
     * Get measure expression tokens for provided measure identifier
     * @param id - identifier of the measure
     */
    getMeasureExpressionTokens(id: string): Promise<IMeasureExpressionToken[]>;
}

/**
 * TODO: SDK8: add public doc
 *
 * @public
 */
export interface IInsightQueryOptions {
    offset?: number;
    limit?: number;
    orderBy?: "id" | "title" | "updated";
    /**
     * Login of the author to filter the insights by
     */
    author?: string;
}

/**
 * TODO: SDK8: add public doc
 *
 * @public
 */
export interface IInsightQueryResult extends IPagedResource<IInsight> {}
