// (C) 2021-2024 GoodData Corporation
import { DashboardAttributeFilterConfigMode, DashboardDateFilterConfigMode } from "@gooddata/sdk-model";
import camelCase from "lodash/camelCase";
import { getTestClassByTitle } from "../support/commands/tools/classes";
import { DropZone } from "./enum/DropZone";
import { DateFilter } from "./dateFilter";
import { AttributeFilterLimit } from "./attributeFilterLimit";

export const NEW_ATTRIBUTE_FILTER_SELECTOR = ".s-add-attribute-filter";
export const ATTRIBUTE_DROPZONE_SELECTOR = ".s-attr-filter-dropzone-box";
export const ATTRIBUTE_FILTER_SELECT_SELECTOR = ".s-attribute_select";
export const ATTRIBUTE_FILTER_BODY_SELECTOR = ".attributes-list";
export const ATTRIBUTE_FILTERS_SELECTOR = ".dash-filters-attribute:not(.dash-filters-date)";
export const FILTER_BAR_SELECTOR = ".dash-filters-visible";
export const FILTER_BAR_SHOW_ALL_BUTTON = ".button-filter-bar-show-all";
export const NO_RELEVANT_VALUES_SELECTOR = ".gd-attribute-filter-empty-filtered-result__next";
export const DATE_FILTERS_SELECTOR = ".dash-filters-date";

export type FilterByType = "normal" | "aggregated";

export class AttributeFilter {
    constructor(private name: string) {}

    getElement() {
        const testClass = getTestClassByTitle(this.name);
        return cy.get(`.dash-filters-attribute ${testClass}`);
    }

    getDeleteButton() {
        return cy.get(".s-delete-button");
    }

    select(name?: string): AttributeFilter {
        const testClass = getTestClassByTitle(name ?? this.name);
        cy.get(`${ATTRIBUTE_FILTER_BODY_SELECTOR} ${testClass}`).should("be.visible").click();
        return this;
    }

    getDropdownElement() {
        return cy.get(".overlay.dropdown-body");
    }

    getAttributeFilterLimit() {
        return new AttributeFilterLimit();
    }

    selectAllValues() {
        this.getDropdownElement().find(".s-select-all-checkbox").should("be.visible").click();
        return this;
    }

    clearAllValues() {
        this.getDropdownElement().find(".s-select-all-checkbox").click();
        this.getDropdownElement()
            .find(".gd-list-all-checkbox")
            .then(($ele) => {
                if ($ele.hasClass("gd-list-all-checkbox-checked")) {
                    this.getDropdownElement().find(".s-select-all-checkbox").click();
                }
            });
        return this;
    }

    selectAttributesWithoutApply(name?: string) {
        this.clearAllValues();
        this.getDropdownElement()
            .find(`.s-attribute-filter-list-item-${camelCase(name)}`)
            .click();
        return this;
    }

    selectAttributeWithoutSearch(name?: string): AttributeFilter {
        this.selectAttributesWithoutApply(name);
        this.apply();
        return this;
    }

    selectAttribute(attributes: string[], index = 0) {
        this.clearAllValues();
        attributes.forEach(($attr) => {
            this.searchAndSelectFilterItem($attr, index);
        });
        return this;
    }

    getValueList() {
        const result = [] as string[];
        cy.get(`.s-attribute-filter-list-item .input-label-text`).each(($li) => {
            result.push($li.text());
        });
        return cy.wrap(result);
    }

    hasValueList(values: string[]) {
        if (values.length === 0) {
            cy.get(".s-isLoading").should("not.exist");
            cy.get(`.s-attribute-filter-list-item .input-label-text`).should("not.exist");
        } else {
            this.getValueList().should("deep.equal", values);
        }
        return this;
    }

    getSelectedValueList() {
        const result = [] as string[];
        cy.get(`.s-attribute-filter-list-item.s-attribute-filter-list-item-selected .input-label-text`).each(
            ($li) => {
                return result.push($li.text());
            },
        );
        return cy.wrap(result);
    }

    hasSelectedValueList(values: string[]) {
        if (values.length === 0) {
            cy.get(".s-isLoading").should("not.exist");
            cy.get(
                `.s-attribute-filter-list-item.s-attribute-filter-list-item-selected .input-label-text`,
            ).should("not.exist");
        } else {
            this.getSelectedValueList().should("deep.equal", values);
        }
        return this;
    }

    apply() {
        this.getDropdownElement().find(".s-apply").should("be.visible").click();
        return this;
    }

    isApplyButtonEnabled(expect: boolean) {
        this.getDropdownElement()
            .find(".s-apply")
            .should(expect ? "not.have.class" : "have.class", "disabled");
        return this;
    }

    search(attributeValue: string) {
        this.getDropdownElement()
            .find(".gd-input-search .gd-input-field")
            .as("searchField")
            .should("be.visible")
            .clear();
        cy.get("@searchField").type(attributeValue);
        return this;
    }

    showAllElementValues() {
        this.getDropdownElement()
            .find(".s-attribute-filter-status-show-all")
            .find(".s-action-show-all")
            .should("be.visible")
            .click();
        this.elementsAreLoaded();
        return this;
    }

    showAllElementValuesIsVisible(value = true) {
        this.getDropdownElement()
            .find(".s-attribute-filter-status-show-all")
            .should(value ? "be.visible" : "not.exist");
        return this;
    }

    clearIrrelevantElementValues() {
        this.getDropdownElement()
            .find(".s-attribute-filter-status-irrelevant-message")
            .find(".s-action-clear")
            .should("be.visible")
            .click();
        this.elementsAreLoaded();
        return this;
    }

    clearIrrelevantElementValuesIsVisible(value = true) {
        this.getDropdownElement()
            .find(".s-attribute-filter-status-irrelevant-message")
            .should(value ? "be.visible" : "not.exist");
        return this;
    }

    containElementsListStatus(value: string) {
        this.getDropdownElement().find(".s-list-status-bar").should("contain.text", value);
        return this;
    }

    elementsAreLoaded() {
        this.getDropdownElement().find(".s-isLoading").should("not.exist");
        return this;
    }

    clearSearch() {
        this.getDropdownElement().find(".gd-input-search .gd-input-field").should("be.visible").clear();
        return this;
    }

    hasSubtitle(value: string) {
        this.getElement().find(".s-attribute-filter-button-subtitle").should("have.text", value);
        return this;
    }

    isValueSelected(attributeValue: string, expected: boolean) {
        this.getDropdownElement()
            .find(`.s-attribute-filter-list-item-${camelCase(attributeValue)}`)
            .should(expected ? "have.class" : "not.have.class", "s-attribute-filter-list-item-selected");
        return this;
    }

    searchAndSelectFilterItem(attributeValue: string, index = 0) {
        this.search(attributeValue);
        this.getDropdownElement()
            .find(`.s-attribute-filter-list-item-${camelCase(attributeValue)}`)
            .eq(index)
            .click();
        return this;
    }

    checkFilter(name: string) {
        const testClass = getTestClassByTitle(name ?? this.name);
        cy.get(`.is-selected${testClass}`);
        return this;
    }

    addAttribute(name: string): AttributeFilter {
        return new FilterBar().addAttribute(name);
    }

    removeFilter() {
        const dataTransfer = new DataTransfer();
        this.getElement().trigger("dragstart", { dataTransfer });

        cy.get(".gd-dropzone-delete").trigger("drop", { dataTransfer });
        return this;
    }

    dragFilter() {
        const dataTransfer = new DataTransfer();
        this.getElement().trigger("dragstart", { dataTransfer });

        cy.get(".gd-dash-content").trigger("dragOver", { dataTransfer });
        return this;
    }

    hasDeleteDropzone() {
        cy.get(".gd-dropzone-delete").should("exist");
        return this;
    }

    configureBearFilterDependency(filteredItem: string | string[]) {
        this.selectConfiguration();
        this.checkBearFilterDependency(filteredItem);
        this.getDropdownElement().find(".s-apply").click();
        return this;
    }

    checkBearFilterDependency(filteredItem: string | string[]) {
        const filteredItems = Array.isArray(filteredItem) ? filteredItem : [filteredItem];
        filteredItems.forEach((filteredItem) => {
            const testClass = getTestClassByTitle(filteredItem);
            this.getDropdownElement()
                .find(`.s-attribute-filter-dropdown-configuration-item${testClass}`)
                .click();
        });
        return this;
    }

    hasBearFilterDependencyEnabled(enabled: boolean) {
        this.getDropdownElement()
            .find(".s-attribute-filter-dropdown-configuration-item")
            .each((item) => {
                cy.wrap(item)
                    .find("[type='checkbox']")
                    .should(enabled ? "be.enabled" : "be.disabled");
            });
        return this;
    }

    isAttributeItemFiltered(expected: boolean) {
        this.getDropdownElement()
            .get(".s-attribute-filter-dropdown-items-filtered")
            .should(expected ? "exist" : "not.exist");
        return this;
    }

    selectConfiguration(delay?: number) {
        // delay to make sure the attribute elements are loaded
        if (delay) {
            cy.wait(delay);
        }

        this.getDropdownElement().find(".s-configuration-button").click();
        return this;
    }

    saveConfiguration() {
        this.getDropdownElement().find(".s-save").click();
        return this;
    }

    closeConfiguration() {
        this.getDropdownElement().find(".s-cancel").click();
        return this;
    }

    changeAttributeLabel(label: string) {
        this.selectConfiguration();
        cy.get(".s-attribute-display-form-button").click();
        cy.get("div:not(.is-selected).gd-list-item span").contains(label).click();

        return this;
    }

    changeSelectionMode(mode: string) {
        this.selectConfiguration();
        this.toggleSelectionModeDropdown();
        this.clickSelectionMode(mode);
        this.getDropdownElement().find(".s-save").click();
        return this;
    }

    toggleSelectionModeDropdown() {
        this.getDropdownElement().find(".s-selection-mode-dropdown-button").click();
        return this;
    }

    clickSelectionMode(mode: string) {
        this.getDropdownElement().find(`.s-selection-mode-dropdown-item-${mode}`).click();
        return this;
    }

    hasSelectionMode(mode: string, value: boolean) {
        this.getDropdownElement()
            .find(`.s-selection-mode-dropdown-item-${mode}`)
            .should("exist")
            .and(value ? "have.class" : "not.have.class", "is-selected");
        return this;
    }

    hasSingleSelectionModeEnabled(exist: boolean) {
        this.getDropdownElement()
            .find(".s-selection-mode-dropdown-item-single")
            .should("exist")
            .and(exist ? "not.have.class" : "have.class", "is-disabled");
        return this;
    }

    toggle() {
        this.getElement().click();
        return this;
    }

    open() {
        this.toggle();
        this.getElement().should("have.class", "gd-is-active");
        return this;
    }

    close() {
        this.toggle();
        this.getElement().should("not.have.class", "gd-is-active");
        return this;
    }

    isLoaded(expect = true) {
        this.getElement().should(expect ? "have.class" : "not.have.class", "gd-is-loaded");
        return this;
    }

    waitFilteringFinished(): this {
        this.getElement().should("have.class", "gd-is-filtering");
        this.getElement().should("not.have.class", "gd-is-filtering");
        return this;
    }

    hasFilterListSize(length: number) {
        this.getDropdownElement().find(".s-list-search-selection-size").should("have.text", `(${length})`);
        return this;
    }

    getConfigurationMode(mode: DashboardAttributeFilterConfigMode) {
        return cy.get(".s-configuration-item-mode").find(`.s-config-state-${mode}`);
    }

    selectConfigurationMode(mode: DashboardAttributeFilterConfigMode) {
        this.getConfigurationMode(mode).click();
        return this;
    }

    hoverOnConfigurationMode(mode: DashboardDateFilterConfigMode) {
        this.getConfigurationMode(mode).trigger("mouseover");
    }

    getHiddenIcon() {
        return this.getElement().find(".s-gd-icon-invisible");
    }

    isHiddenIconVisible(expected = true) {
        this.getHiddenIcon().should(expected ? "be.visible" : "not.exist");
        return this;
    }

    hoverOnHiddenIcon() {
        this.getHiddenIcon().trigger("mouseover");
        return this;
    }

    getLockedIcon() {
        return this.getElement().find(".s-gd-icon-lock");
    }

    isLockedIconVisible(expected = true) {
        this.getLockedIcon().should(expected ? "be.visible" : "not.exist");
        return this;
    }

    hoverOnLockedIcon() {
        this.getLockedIcon().trigger("mouseover");
        return this;
    }

    isVisible(expected = true) {
        this.getElement().should(expected ? "be.visible" : "not.exist");
        return this;
    }

    hasDropdownBodyOpen(expected = true) {
        this.getDropdownElement().should(expected ? "be.visible" : "not.exist");
        return this;
    }

    hasConfigurationModeCheckedAt(mode: DashboardAttributeFilterConfigMode) {
        this.getConfigurationMode(mode).should("have.attr", "checked");
        return this;
    }

    hasNoRelevantMessage() {
        this.getDropdownElement().find(NO_RELEVANT_VALUES_SELECTOR).should("have.text", "No relevant values");
        return this;
    }
    deleteFiltervaluesBy(filterName: string, filterType: FilterByType = "normal") {
        this.selectConfiguration();
        if (filterType === "normal") {
            cy.get(`.attribute-filter__limit__item__title[title='${filterName}']`).realHover();
            cy.get(
                `.attribute-filter__limit__item__title[title='${filterName}'] + .s-filter-limit-delete`,
            ).click();
        } else {
            cy.get(`.attribute-filter__limit__item__title--aggregated[title='${filterName}']`).realHover();
            cy.get(
                `.attribute-filter__limit__item__title--aggregated[title='${filterName}'] + .s-filter-limit-delete`,
            ).click();
        }
        this.getDropdownElement().find(".s-apply").click();
        return this;
    }

    /**
     * Works only for Tiger backend (available filter values UI)
     *
     * @param parentFilterName - name(s) of parent filter that should be configured as elements limit
     */
    configureLimitingParentFilterDependency(parentFilterName: string | string[]) {
        this.selectConfiguration();

        const parentFilters = typeof parentFilterName === "string" ? [parentFilterName] : parentFilterName;

        parentFilters.forEach((parentFilterName) => {
            cy.get(".s-add").click();
            cy.get(".s-add-limit-dashboard_filter").click();
            cy.get(getTestClassByTitle(parentFilterName, "dashboard-filter-")).click();
        });

        this.getDropdownElement().find(".s-apply").click();
        return this;
    }

    /**
     * Works only for Tiger backend (available filter values UI)
     *
     * @param metricName - name(s) of metrics that should be configured as elements limit
     */
    configureLimitingMetricDependency(metricName: string | string[]) {
        this.selectConfiguration();
        const metrics = typeof metricName === "string" ? [metricName] : metricName;

        metrics.forEach((metricName) => {
            cy.get(".s-add").click();
            this.getAttributeFilterLimit().addMetric().selectMetricItem(metricName);
        });

        this.getDropdownElement().find(".s-apply").click();
        return this;
    }

    /**
     * Open add limit dashboard filter dialog
     */
    openAddLimitDashboardFilter() {
        cy.get(".s-add").click();
        cy.get(".s-add-limit-dashboard_filter").click();
    }

    closeAddLimitDashboardFilter() {
        cy.get(".configuration-panel-header-title.clickable").click();
        return this;
    }

    /**
     * Works only for Tiger backend (available filter values UI)
     *
     * @param parentFilterName - name of parent specific date filter that current filter belong to
     * @param visible - visibility of the filter, default is true
     */
    isSpecificDateFilterVisible(parentFilterName: string, visible = true): this {
        this.openAddLimitDashboardFilter();
        cy.get(".s-dashboard-filter-" + parentFilterName).should(($element) => {
            if (visible) {
                // eslint-disable-next-line jest/valid-expect
                expect($element).not.to.have.class("is-disabled");
            } else {
                // eslint-disable-next-line jest/valid-expect
                expect($element).to.have.class("is-disabled");
            }
        });
        this.closeAddLimitDashboardFilter();
        return this;
    }

    /**
     * Works only for Tiger backend (available filter values UI)
     *
     * @param parentFilterName - name of parent common date filter that current filter belong to
     * @param visible - visibility of the filter, default is true
     */
    isCommonDateFilterVisible(parentFilterName: string, visible = true): this {
        this.openAddLimitDashboardFilter();
        cy.get(getTestClassByTitle("Date range", "dashboard-filter-")).click();
        cy.get(".date-filter__limit__popup__item.s-" + parentFilterName).should(($element) => {
            if (visible) {
                // eslint-disable-next-line jest/valid-expect
                expect($element).not.to.have.class("is-disabled");
            } else {
                // eslint-disable-next-line jest/valid-expect
                expect($element).to.have.class("is-disabled");
            }
        });
        this.closeAddLimitDashboardFilter();
        return this;
    }

    /**
     * Works only for Tiger backend (available filter values UI)
     *
     * @param parentFilterName - name(s) of parent filter that current filter belong to
     * @param dateType - type of date filter (Date range or Date specific)
     */
    configureLimitingDateFilterDependency(parentFilterName: string, dateType: string) {
        this.openAddLimitDashboardFilter();

        if (dateType == "Date range") {
            cy.get(getTestClassByTitle(dateType, "dashboard-filter-")).click();
            cy.get(".date-filter__limit__popup__item.s-" + parentFilterName).click();
        } else {
            cy.get(".s-dashboard-filter-" + parentFilterName).click();
        }

        this.getDropdownElement().find(".s-apply").click();
        return this;
    }

    searchMetricDependency(metricName: string) {
        cy.get(".s-add").click();
        this.getAttributeFilterLimit().addMetric();
        this.getAttributeFilterLimit().searchMetricItem(metricName);
        return this;
    }

    selectMetricDependency(metricName: string) {
        this.getAttributeFilterLimit().selectMetricItem(metricName);
        this.getDropdownElement().find(".s-apply").click();
        return this;
    }

    getNoDataMetricDependency() {
        this.getAttributeFilterLimit().getNodata();
        return this;
    }
}

export class FilterBar {
    getElement() {
        return cy.get(FILTER_BAR_SELECTOR);
    }

    allVisible(expect: boolean): FilterBar {
        this.getElement().should(expect ? "have.class" : "not.have.class", "s-dash-filters-visible-all");
        return this;
    }

    getShowAllButton() {
        return cy.get(FILTER_BAR_SHOW_ALL_BUTTON);
    }

    toggleShowAll(): FilterBar {
        this.getShowAllButton().click();
        return this;
    }

    addAttribute(name: string): AttributeFilter {
        this.dragAttributeToFilterBar();
        new AttributeFilter(name).search(name).select(name);
        cy.get(ATTRIBUTE_FILTER_SELECT_SELECTOR).should("not.exist");
        return new AttributeFilter(name);
    }

    addDate(name: string): DateFilter {
        this.dragDateToFilterBar();
        new DateFilter(name).search(name).select(name);
        cy.get(ATTRIBUTE_FILTER_SELECT_SELECTOR).should("not.exist");
        return new DateFilter(name);
    }

    moveAttributeFilter(fromIndex: number, toIndex: number, dropzone: DropZone) {
        const dataTransfer = new DataTransfer();
        cy.get(".s-attribute-filter").eq(fromIndex).trigger("dragstart", { dataTransfer });
        cy.get(".dash-filters-notdate .s-attribute-filter")
            .eq(toIndex)
            .parents(".draggable-attribute-filter")
            .find(dropzone)
            .trigger("drop", { dataTransfer });
        return this;
    }

    dragAttributeToFilterBar() {
        const dataTransfer = new DataTransfer();
        cy.get(ATTRIBUTE_FILTER_SELECT_SELECTOR).should("not.exist");
        cy.get(NEW_ATTRIBUTE_FILTER_SELECTOR).trigger("dragstart", { dataTransfer });
        cy.get(ATTRIBUTE_DROPZONE_SELECTOR)
            .should("have.class", "attr-filter-dropzone-box-active")
            .trigger("drop", { dataTransfer });
        cy.get(ATTRIBUTE_FILTER_SELECT_SELECTOR).should("exist");

        return this;
    }

    dragDateToFilterBar() {
        const dataTransfer = new DataTransfer();
        cy.get(ATTRIBUTE_FILTER_SELECT_SELECTOR).should("not.exist");
        cy.get(NEW_ATTRIBUTE_FILTER_SELECTOR).trigger("dragstart", { dataTransfer });
        cy.get(ATTRIBUTE_DROPZONE_SELECTOR)
            .should("have.class", "attr-filter-dropzone-box-active")
            .trigger("drop", { dataTransfer });
        cy.get(ATTRIBUTE_FILTER_SELECT_SELECTOR).should("exist");
        cy.get(".s-datedatasets").click();
        return this;
    }

    searchAttributeName(name: string) {
        new AttributeFilter(name).search(name);
        return this;
    }

    showTooltipDialog(name: string) {
        const testClass = getTestClassByTitle(name);
        cy.get(`${testClass} .gd-attribute-item-tooltip-icon`).invoke("show").trigger("mouseover");
        return this;
    }

    hasMatchingAttributeName(expect: boolean) {
        cy.get(".gd-no-matching-data").should(expect ? "not.exist" : "exist");
        return this;
    }

    getAttributeList() {
        const result = [] as string[];
        this.getElement()
            .find(`.s-attribute-filter-button-title`)
            .each(($li) => {
                return result.push($li.text());
            });
        return cy.wrap(result);
    }

    hasAttributeLength(length: number) {
        cy.get(ATTRIBUTE_FILTERS_SELECTOR).should("have.length", length);
        return this;
    }

    hasAttributeFilters(names: string[]) {
        this.getAttributeList().should("have.length", names.length);

        names.forEach((name, index) => {
            const testClass = getTestClassByTitle(name);
            cy.get(`.dash-filters-attribute`).eq(index).find(`${testClass}`).should("exist");
        });
    }

    getAttributeSubTitle(attributeFilter: string) {
        const testClass = getTestClassByTitle(attributeFilter);
        return cy.get(`${testClass} .s-attribute-filter-button-subtitle`);
    }

    getSelectionStatus() {
        return cy.get(`.s-dropdown-attribute-selection-list`);
    }

    getAttributeSubTitleViewMode() {
        return cy.get(".dash-filters-all .s-attribute-filter .s-attribute-filter-button-subtitle");
    }

    /**
     *
     * @param attributeFilters - array of pairs [arrtibuteName, filterButtonTitle ]
     */
    hasAttributeFiltersWithValue(attributeFilters: ReadonlyArray<[string, string]>) {
        this.getAttributeList().should("have.length", attributeFilters.length);

        attributeFilters.forEach((attributeFilter) => {
            const testClass = getTestClassByTitle(attributeFilter[0]);
            cy.get(
                `.dash-filters-attribute ${testClass}.s-attribute-filter .s-attribute-filter-button-subtitle`,
            ).should("have.text", attributeFilter[1]);
        });
    }

    getDateList() {
        return cy.get(DATE_FILTERS_SELECTOR);
    }

    hasDateFilters(names: string[]) {
        this.getDateList().should("have.length", names.length);

        names.forEach((name, index) => {
            cy.get(".dash-filters-date .s-date-filter-title").eq(index).should("have.text", name);
        });
        return this;
    }

    getDateSubTitleViewMode(name: string) {
        const testClass = getTestClassByTitle(name, "date-filter-button-");
        return cy.get(`.dash-filters-all .s-date-filter-button${testClass} .s-button-text`);
    }
}
