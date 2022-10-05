// (C) 2022 GoodData Corporation
import { IAttributeElement } from "@gooddata/sdk-model";
import { GoodDataSdkError } from "@gooddata/sdk-ui";
import { IInvertableSelectRenderItemProps } from "@gooddata/sdk-ui-kit";

/**
 * @alpha
 */
export interface IAttributeFilterElementsSelectProps {
    items: IAttributeElement[];

    totalItemsCount: number;
    totalItemsCountWithCurrentSettings: number;

    isInverted: boolean;
    selectedItems: IAttributeElement[];
    onSelect: (selectedItems: IAttributeElement[], isInverted: boolean) => void;

    searchString: string;
    onSearch: (searchString: string) => void;

    isLoading: boolean;
    isLoadingNextPage: boolean;
    onLoadNextPage: () => void;
    nextPageSize: number;

    parentFilterTitles: string[];
    isFilteredByParentFilters: boolean;
    error?: GoodDataSdkError;
}

/**
 * @alpha
 */
export type IAttributeFilterElementsSelectItemProps = IInvertableSelectRenderItemProps<IAttributeElement>;
