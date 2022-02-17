// (C) 2022 GoodData Corporation
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { IAttributeFilter, ObjRef } from "@gooddata/sdk-model";

export interface AttributeFilterButtonContextProps {
    backend: IAnalyticalBackend;
    workspace: string;
    identifier: string;
    filter: IAttributeFilter;
    filterObjRef: ObjRef;
}

export interface AttributeFilterButtonHookOwnProps {
    isElementsByRef: boolean;
    parentFilters: IAttributeFilter[];
    parentFilterOverAttribute: ObjRef | ((parentFilter: IAttributeFilter, index: number) => ObjRef);
}
