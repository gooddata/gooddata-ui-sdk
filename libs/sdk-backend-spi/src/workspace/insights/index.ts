// (C) 2019-2020 GoodData Corporation

import {
    IVisualizationClass,
    IInsight,
    IAttributeDisplayForm,
    IMeasureExpressionToken,
    IInsightDefinition,
    ObjRef,
} from "@gooddata/sdk-model";
import { IPagedResource } from "../../common/paging";

/**
 * TODO: SDK8: add public doc
 *
 * @public
 */
export interface IWorkspaceMetadata {
    getVisualizationClass(ref: ObjRef): Promise<IVisualizationClass>;
    getVisualizationClasses(): Promise<IVisualizationClass[]>;
    getInsight(ref: ObjRef): Promise<IInsight>;
    getInsights(options?: IInsightQueryOptions): Promise<IInsightQueryResult>;
    createInsight(insight: IInsightDefinition): Promise<IInsight>;
    updateInsight(insight: IInsight): Promise<IInsight>;
    deleteInsight(ref: ObjRef): Promise<void>;
    /**
     * Gets the attribute display form with the provided identifier.
     * @param ref - ref of the attribute display form to retrieve
     * @public
     */
    getAttributeDisplayForm(ref: ObjRef): Promise<IAttributeDisplayForm>;

    /**
     * Get measure expression tokens for provided measure identifier
     * @param ref - ref of the measure
     */
    getMeasureExpressionTokens(ref: ObjRef): Promise<IMeasureExpressionToken[]>;
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
