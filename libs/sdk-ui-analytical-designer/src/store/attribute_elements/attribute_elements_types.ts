// (C) 2020-2026 GoodData Corporation

import { type ObjRef } from "@gooddata/sdk-model";

export interface IAttributeElement {
    uri: string;
    title: string;
}

export type IAttributeElements = IAttributeElement[];

export interface IAttributeElementsQuery {
    attributeDisplayFormRef: ObjRef;
    searchPhrase: string;
}

export interface IAttributeElementsStatus {
    items: IAttributeElements;
    isLoading: boolean;
    total: number;
    filteredTotal: number;
}

export interface IAttributeElementsState extends IAttributeElementsStatus {
    query: IAttributeElementsQuery;
}
