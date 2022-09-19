// (C) 2007-2022 GoodData Corporation
import { IElementsQueryResult } from "@gooddata/sdk-backend-spi";

/**
 * An object of this type will be passed down to the children render function by AttributeElements component.
 *
 * @deprecated use the {@link IAttributeFilterHandler} and its implementations to create custom attribute filter components
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
