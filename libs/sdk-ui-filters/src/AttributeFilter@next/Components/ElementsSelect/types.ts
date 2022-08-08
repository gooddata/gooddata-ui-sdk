// (C) 2022 GoodData Corporation
import { IAttributeElement } from "@gooddata/sdk-model";

/**
 * @alpha
 */
export interface IAttributeFilterElementsSelectProps {
    items: IAttributeElement[];

    totalItemsCount: number;

    isInverted: boolean;
    selectedItems: IAttributeElement[];
    onSelect: (selectedItems: IAttributeElement[], isInverted: boolean) => void;

    searchString: string;
    onSearch: (searchString: string) => void;

    isLoading: boolean;
    isLoadingNextPage: boolean;
    onLoadNextPage?: () => void;
    nextPageSize: number;
}
