// (C) 2024 GoodData Corporation

import { type ObjRef } from "../objRef/index.js";

/**
 * Entity that represents Workspace Data Filter
 *
 * @alpha
 */
export interface IWorkspaceDataFilter {
    /**
     * @deprecated use {@link IWorkspaceDataFilter#ref} instead.
     */
    id: string;
    ref: ObjRef;
    title?: string;
    columnName?: string;
    settings: IWorkspaceDataFilterSetting[];
    isInherited: boolean;
}

/**
 * Entity that represents Workspace Data Filter setting
 *
 * @alpha
 */
export interface IWorkspaceDataFilterSetting {
    /**
     * @deprecated use {@link IWorkspaceDataFilterSetting#ref} instead.
     */
    id: string;
    ref: ObjRef;
    title?: string;
    filterValues: string[];
    isInherited: boolean;
}

/**
 * Entity that contains data necessary to create a new Workspace Data Filter
 *
 * @alpha
 */
export interface IWorkspaceDataFilterDefinition {
    id?: string;
    title: string;
    columnName: string;
}
