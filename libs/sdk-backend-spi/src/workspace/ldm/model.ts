// (C) 2024 GoodData Corporation

/**
 * Interface that represents logical model date dataset.
 * @internal
 */
export interface IDateDataset {
    id: string;
    title: string;
    description?: string;
}

/**
 * Service for querying information about logical data model.
 *
 * This is internal service that returns data for internal UI application. It will be refactored once more
 * methods are added. This method would live in TigerSpecificFunctions, as the interface is experimental,
 * but Meditor has an issue with injecting both analytical backend and tiger specific functions objects.
 *
 * @internal
 */
export interface IWorkspaceLogicalModelService {
    /**
     * Returns information about date datasets in the workspace.
     * @param includeParents - true if parents should be included/
     */
    getDatasets(includeParents: boolean): Promise<IDateDataset[]>;
}
