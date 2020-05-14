// (C) 2007-2018 GoodData Corporation
import { IElementQueryResult } from "@gooddata/sdk-backend-spi";

export interface IAttributeElementsChildren {
    validElements: IElementQueryResult;

    /**
     * Function to trigger load of next page of attribute elements.
     */
    loadMore: () => void;
    isLoading: boolean;
    error: any;
}
