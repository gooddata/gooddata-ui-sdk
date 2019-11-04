// (C) 2007-2018 GoodData Corporation
import { IElementQueryResult } from "@gooddata/sdk-backend-spi";

export interface IAttributeElementsChildren {
    validElements: IElementQueryResult;
    loadMore: () => void;
    isLoading: boolean;
    error: any;
}
