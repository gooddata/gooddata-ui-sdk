// (C) 2023 GoodData Corporation
import { ICatalogAttributeHierarchy, ObjRef } from "@gooddata/sdk-model";

export type EmptyParamCallback = () => void;
export type SaveOrUpdateCallback = (attributeHierarchy: ICatalogAttributeHierarchy) => void;
export type SetLoadingCallback = (isLoading: boolean) => void;

/**
 * @internal
 */
export interface IAttributeHierarchyDialogProps {
    initialAttributeRef?: ObjRef;
    editingAttributeHierarchy?: ICatalogAttributeHierarchy;
    onClose?: EmptyParamCallback;
    onSaveOrUpdate?: SaveOrUpdateCallback;
}

export enum CatalogAttributeDataType {
    ATTRIBUTE = "attribute",
    DATE_ATTRIBUTE = "dateAttribute",
}

export interface ICatalogAttributeData {
    type?: CatalogAttributeDataType;
    ref?: ObjRef;
    title?: string;
    icon?: string;
}

export interface IAttributeData extends ICatalogAttributeData {
    completed?: boolean;
}
