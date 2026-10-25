// (C) 2021-2026 GoodData Corporation

import { fireEvent } from "@testing-library/react";

const ADDITIONAL_DATE_ATTRIBUTE_SELECTOR = ".s-adi-additional-date-attribute";
const REMOVE_ADDITIONAL_DATE_ATTRIBUTE_SELECTOR = ".s-remove-attribute-filter";
const GRANULARITIES_DROPDOWN_BUTTON_SELECTOR = ".s-adi-additional-date-granularities-dropdown-button";
const GRANULARITIES_DROPDOWN_SELECTOR = ".s-adi-additional-date-granularities-dropdown";
const GRANULARITY_OPTION_SELECTOR = ".s-granularity-item";
const SINGLE_FILTER_MIGRATED_WARNING_SELECTOR = ".s-additional-filter-reset-warning";
const MULTIPLE_FILTERS_MIGRATED_WARNING_SELECTOR = ".s-additional-filter-reset-warnings";
const EMPTY_VALUES_FILTER_SELECTOR = ".s-adi-empty-values-filter";
const EMPTY_VALUES_FILTER_BUTTON_SELECTOR = ".s-adi-empty-values-filter-button";
const EMPTY_VALUES_FILTER_REMOVE_SELECTOR = ".s-remove-empty-values-filter";
const EMPTY_VALUES_FILTER_DROPDOWN_ITEM_SELECTOR = ".s-adi-empty-values-filter-item";

export class AdditionalDateAttributesFragment {
    public container: HTMLElement;

    constructor(container: HTMLElement) {
        this.container = container;
    }

    public getAdditionalDateFilters = () => {
        return this.container.querySelectorAll(ADDITIONAL_DATE_ATTRIBUTE_SELECTOR);
    };

    public getAdditionalDateFilter = (granularity: string) => {
        return this.container.querySelector(`${ADDITIONAL_DATE_ATTRIBUTE_SELECTOR}-${granularity}`);
    };

    public getAdditionalDateFilterRemoveButton = (granularity: string) => {
        return this.getAdditionalDateFilter(granularity).querySelector(
            REMOVE_ADDITIONAL_DATE_ATTRIBUTE_SELECTOR,
        );
    };

    public removeAdditionalDateFilter = (granularity: string) => {
        fireEvent.click(this.getAdditionalDateFilterRemoveButton(granularity));
    };

    public getGranularitiesDropdownButton = () => {
        return this.container.querySelector(GRANULARITIES_DROPDOWN_BUTTON_SELECTOR);
    };

    public clickOnGranularitiesDropdownButton = () => {
        fireEvent.click(this.getGranularitiesDropdownButton());
    };

    public getGranularitiesDropdown = () => {
        return document.querySelector(GRANULARITIES_DROPDOWN_SELECTOR);
    };

    public getGranularityOptions = () => {
        return this.getGranularitiesDropdown().querySelectorAll(GRANULARITY_OPTION_SELECTOR);
    };

    public getGranularityOption = (granularity: string) => {
        return this.getGranularitiesDropdown().querySelector(`.s-${granularity}`);
    };

    public selectGranularity = (granularity: string) => {
        this.clickOnGranularitiesDropdownButton();
        const granularityOption = this.getGranularityOption(granularity);
        fireEvent.click(granularityOption);
    };

    public getWarningPanel = () => {
        if (this.container.querySelector(MULTIPLE_FILTERS_MIGRATED_WARNING_SELECTOR)) {
            return "multiple";
        }
        if (this.container.querySelector(SINGLE_FILTER_MIGRATED_WARNING_SELECTOR)) {
            return "single";
        }
        return "none";
    };

    public getEmptyValuesFilter = () => {
        return this.container.querySelector(EMPTY_VALUES_FILTER_SELECTOR);
    };

    public getEmptyValuesFilterButton = () => {
        return this.container.querySelector(EMPTY_VALUES_FILTER_BUTTON_SELECTOR);
    };

    public getEmptyValuesFilterRemoveButton = () => {
        return this.container.querySelector(EMPTY_VALUES_FILTER_REMOVE_SELECTOR);
    };

    public removeEmptyValuesFilter = () => {
        const removeButton = this.getEmptyValuesFilterRemoveButton();
        if (removeButton) {
            fireEvent.click(removeButton);
        }
    };

    public getEmptyValuesFilterDropdownItem = () => {
        return document.querySelector(EMPTY_VALUES_FILTER_DROPDOWN_ITEM_SELECTOR);
    };

    public addEmptyValuesFilter = () => {
        this.clickOnGranularitiesDropdownButton();
        const item = this.getEmptyValuesFilterDropdownItem();
        if (item) {
            fireEvent.click(item);
        }
    };
}
