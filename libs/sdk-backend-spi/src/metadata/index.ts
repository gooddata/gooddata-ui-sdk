// (C) 2019 GoodData Corporation

import {
    IVisualizationClass,
    IInsight,
    IAttributeDisplayForm,
    IMeasureExpressionToken,
} from "@gooddata/sdk-model";

/**
 * TODO: SDK8: add public doc
 *
 * @public
 */
export interface IWorkspaceMetadata {
    getVisualizationClass(id: string): Promise<IVisualizationClass>;
    getVisualizationClasses(): Promise<IVisualizationClass[]>;
    getInsight(id: string): Promise<IInsight>;
    /**
     * Gets the attribute display form with the provided identifier.
     * @param id - identifier of the attribute display form to retrieve
     * @public
     */
    getAttributeDisplayForm(id: string): Promise<IAttributeDisplayForm>;

    /**
     * Get measure expression tokens for provided measure identifier
     * @param id - idenrifier of the measure
     */
    getMeasureExpressionTokens(id: string): Promise<IMeasureExpressionToken[]>;
}
