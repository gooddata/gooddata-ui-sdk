// (C) 2007-2018 GoodData Corporation
import { IElementQueryResult } from "@gooddata/sdk-backend-spi";

export interface IAttributeDisplayForm {
    meta: {
        title: string;
        uri: string;
        identifier: string;
    };
}

export interface IAttributeElement {
    uri: string;
    title: string;
}

export interface IAttributeElementsChildren {
    validElements: IElementQueryResult;
    loadMore: () => void;
    isLoading: boolean;
    error: any;
}
