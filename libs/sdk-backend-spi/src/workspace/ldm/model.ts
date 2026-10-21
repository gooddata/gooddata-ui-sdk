// (C) 2024-2026 GoodData Corporation

import { type IDeclarativeLogicalModel, type IDeclarativeWorkspaceLayout } from "@gooddata/sdk-model";

/**
 * Interface that represents logical model date dataset.
 * @alpha
 */
export interface IDateDataset {
    id: string;
    title: string;
    description?: string;
}

/**
 * Options for reading the declarative logical data model.
 *
 * @alpha
 */
export interface IDeclarativeLogicalModelOptions {
    /**
     * When true, the model also contains the datasets that the workspace inherits from its parents.
     * Defaults to false.
     */
    includeParents?: boolean;
}

/**
 * Service for querying and changing the logical data model of a workspace.
 *
 * @alpha
 */
export interface IWorkspaceLogicalModelService {
    /**
     * Returns information about date datasets in the workspace.
     * @param includeParents - true if parents should be included/
     */
    getDatasets(includeParents: boolean): Promise<IDateDataset[]>;

    /**
     * Returns the logical data model of the workspace in the declarative form.
     *
     * @param options - options of the read
     */
    getDeclarativeModel(options?: IDeclarativeLogicalModelOptions): Promise<IDeclarativeLogicalModel>;

    /**
     * Replaces the logical data model of the workspace.
     *
     * @param model - the new logical data model
     */
    setDeclarativeModel(model: IDeclarativeLogicalModel): Promise<void>;

    /**
     * Replaces the logical data model and the analytical objects of the workspace in one request.
     *
     * @remarks
     * Use this to provision a workspace from a layout that the backend exported, for example demo content.
     *
     * @param layout - the logical data model and the analytical objects
     */
    setDeclarativeLayout(layout: IDeclarativeWorkspaceLayout): Promise<void>;
}
