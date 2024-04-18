// (C) 2024 GoodData Corporation

/**
 * Entity that represents Workspace Data Filter
 *
 * @alpha
 */
export interface IWorkspaceDataFilter {
    id: string;
    title?: string;
    settings: IWorkspaceDataFilterSetting[];
}

/**
 * Entity that represents Workspace Data Filter setting
 *
 * @alpha
 */
export interface IWorkspaceDataFilterSetting {
    id: string;
    title?: string;
    filterValues: string[];
}
