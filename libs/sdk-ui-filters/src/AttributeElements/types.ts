// (C) 2007-2020 GoodData Corporation
import { IElementsQueryResult } from "@gooddata/sdk-backend-spi";

/**
 * An object of this type will be passed down to the children render function by AttributeElements component.
 * @public
 */
export interface IAttributeElementsChildren {
    /**
     * Loaded elements
     */
    validElements: IElementsQueryResult;

    /**
     * Function to trigger load of next page of attribute elements.
     */
    loadMore: () => void;

    /**
     * Indicates whether the attribute elements are currently loading from the server.
     *
     * True if loading. False if done loading.
     */
    isLoading: boolean;

    /**
     * Indicates whether an error has occurred while loading
     *
     * Undefined if no error.
     */
    error: any;
}
