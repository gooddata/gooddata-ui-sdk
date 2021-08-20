// (C) 2021 GoodData Corporation

import { ObjRef } from "@gooddata/sdk-model";

export interface IAttributeFilterParent {
    parentRef: ObjRef;
    connectingAttributeRef: ObjRef;
}

export interface IAttributeFiltersMetaState {
    [uri: string]: IAttributeFilterMeta;
}

export interface IAttributeFilterMeta {
    ref: ObjRef;
    id?: string;
    title: string;
    attributeRef: ObjRef;
}

export interface IAttributeElementWithId {
    uri: string;
    title: string;
    id: string;
}
