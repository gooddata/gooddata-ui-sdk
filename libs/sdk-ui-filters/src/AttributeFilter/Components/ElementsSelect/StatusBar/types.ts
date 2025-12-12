// (C) 2021-2025 GoodData Corporation

import { type IAttributeElement } from "@gooddata/sdk-model";

/**
 * It represents component that display status of current selection.
 * @beta
 */
export interface IAttributeFilterStatusBarProps {
    /**
     * Number of elements that respect current criteria.
     */
    totalElementsCountWithCurrentSettings: number | undefined;

    /**
     * Indicate that elements are filtered by parents filters or not.
     */
    isFilteredByParentFilters: boolean;

    /**
     * Indicate if the elements are filtered by limit validation items or not.
     *
     * @beta
     * @remarks Use only when platform supports limiting validation items.
     */
    isFilteredByLimitingValidationItems?: boolean;

    /**
     * Indicates if the elements are filtered by dependent date filters or not.
     *
     * @beta
     */
    isFilteredByDependentDateFilters?: boolean;

    /**
     * List of parent filter titles that filter current elements.
     *
     * @beta
     */
    parentFilterTitles: string[];

    /**
     * Indicate that current filter is inverted {@link @gooddata/sdk-model#INegativeAttributeFilter} or not {@link @gooddata/sdk-model#IPositiveAttributeFilter}
     *
     * @beta
     */
    isInverted: boolean;

    /**
     * List of selected items
     * @beta
     */
    selectedItems: IAttributeElement[];

    /**
     * Item title getter used to get translated item empty value
     *
     * @beta
     */
    getItemTitle: (item: IAttributeElement) => string;

    /**
     * Maximum selected items
     *
     * @beta
     */
    selectedItemsLimit: number;

    /**
     * This enables "show filtered elements" option which manages showing filtered elements.
     */
    enableShowingFilteredElements?: boolean;

    /**
     * Title of the attribute used for dependent filter configuration.
     *
     * @remarks Used only when showing filtered elements is enabled.
     */
    attributeTitle?: string;

    /**
     * Show filtered elements callback.
     *
     * @remarks Used only when showing filtered elements is enabled.
     */
    onShowFilteredElements?: () => void;

    /**
     * Irrelevant/filtered out selection elements which are still effective.
     *
     * @remarks Used only when showing filtered elements is enabled.
     */
    irrelevantSelection?: IAttributeElement[];

    /**
     * Clear irrelevant/filtered out selection callback.
     *
     * @remarks Used only when showing filtered elements is enabled.
     */
    onClearIrrelevantSelection?: () => void;

    /**
     * Whether the filter is rendered without apply button.
     *
     * @remarks Usually true (in case of dashboard) when filtersApplyMode.mode === "ALL_AT_ONCE"
     */
    withoutApply?: boolean;
}
