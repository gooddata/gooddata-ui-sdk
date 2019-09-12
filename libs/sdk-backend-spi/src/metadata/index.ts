// (C) 2019 GoodData Corporation

import { IVisualizationClass, IInsight } from "@gooddata/sdk-model";

/**
 * TODO: SDK8: add public doc
 *
 * @public
 */
export interface IWorkspaceMetadata {
    getVisualizationClass(id: string): Promise<IVisualizationClass>;
    getVisualizationClasses(): Promise<IVisualizationClass[]>;
    getInsight(id: string): Promise<IInsight>;
}
