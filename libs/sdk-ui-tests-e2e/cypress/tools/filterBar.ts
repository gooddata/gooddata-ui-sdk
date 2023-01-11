// (C) 2021-2022 GoodData Corporation

import { getTestClassByTitle } from "../support/commands/tools/classes";
import { DropZone } from "./enum/DropZone";

export const NEW_ATTRIBUTE_FILTER_SELECTOR = ".s-add-attribute-filter";
export const ATTRIBUTE_DROPZONE_SELECTOR = ".s-attr-filter-dropzone-box";
export const ATTRIBUTE_FILTER_BODY_SELECTOR = ".attributes-list";
export const ATTRIBUTE_FILTERS_SELECTOR = ".dash-filters-attribute:not(.dash-filters-date)";
export const FILTER_BAR_SELECTOR = ".dash-filters-visible";
export const FILTER_BAR_SHOW_ALL_BUTTON = ".button-filter-bar-show-all";

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
        cy.get(`${ATTRIBUTE_FILTER_BODY_SELECTOR} ${testClass}`).click({ force: true });
        return this;
    }

    getDropdownElement() {
        return cy.get(".overlay.dropdown-body");
    }

    selectAllValues() {
        this.getDropdownElement().find(".s-select-all-checkbox").click();
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

    selectAttributeWithoutSearch(name?: string): AttributeFilter {
        this.clearAllValues();
        this.getDropdownElement()
            .find(`.s-attribute-filter-list-item[title="${name}"]`)
            .click({ force: true });
        this.apply();
        return this;
    }

    selectAttribute(attributes: string[]) {
        this.clearAllValues();
        attributes.forEach(($attr) => {
            this.searchAndSelectFilterItem($attr);
        });
        return this;
    }

    getValueList() {
        const result = [] as string[];
        cy.get(`.s-attribute-filter-list-item .input-label-text`).each(($li) => {
            return result.push($li.text());
        });
        return cy.wrap(result);
    }

    apply() {
        this.getDropdownElement().find(".s-apply").click({ scrollBehavior: false });
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
            .find(".gd-list-searchfield .gd-input-field")
            .should("be.visible")
            .clear({ force: true })
            .type(attributeValue, { force: true });
        return this;
    }

    isValueSelected(attributeValue: string, expected: boolean) {
        this.getDropdownElement()
            .find(`.s-attribute-filter-list-item[title="${attributeValue}"]`)
            .should(expected ? "have.class" : "not.have.class", "s-attribute-filter-list-item-selected");
        return this;
    }

    searchAndSelectFilterItem(attributeValue: string) {
        this.search(attributeValue);
        this.getDropdownElement()
            .find(`.s-attribute-filter-list-item[title="${attributeValue}"]`)
            .should("be.visible")
            .click({ force: true });
        return this;
    }

    checkFilter(name: string) {
        const testClass = getTestClassByTitle(name ?? this.name);
        cy.get(`.is-selected${testClass}`);
        return this;
    }

    addAttribute(name: string): AttributeFilter {
        const dataTransfer = new DataTransfer();
        cy.get(NEW_ATTRIBUTE_FILTER_SELECTOR).trigger("dragstart", {
            dataTransfer,
        });

        cy.get(ATTRIBUTE_DROPZONE_SELECTOR).trigger("drop", {
            dataTransfer,
        });
        return new AttributeFilter(name).search(name).select();
    }

    removeFilter() {
        const dataTransfer = new DataTransfer();
        this.getElement().trigger("dragstart", {
            dataTransfer,
        });

        cy.get(".gd-dropzone-delete").trigger("drop", {
            dataTransfer,
        });
        return this;
    }

    dragFilter() {
        const dataTransfer = new DataTransfer();
        this.getElement().trigger("dragstart", {
            dataTransfer,
        });

        cy.get(".gd-dash-content").trigger("dragOver", {
            dataTransfer,
        });
        return this;
    }

    hasDeleteDropzone() {
        cy.get(".gd-dropzone-delete").should("exist");
        return this;
    }

    configureDependency(filteredItem: string) {
        const testClass = getTestClassByTitle(filteredItem);
        this.selectConfiguration();
        this.getDropdownElement()
            .find(`.s-attribute-filter-dropdown-configuration-item${testClass}`)
            .click({ scrollBehavior: false });

        this.getDropdownElement().find(".s-apply").click({ scrollBehavior: false });
        return this;
    }

    isAttributeItemFiltered(expected: boolean) {
        this.getDropdownElement()
            .get(".s-attribute-filter-dropdown-items-filtered")
            .should(expected ? "exist" : "not.exist");
        return this;
    }

    selectConfiguration() {
        this.getDropdownElement().find(".s-configuration-button").click({ scrollBehavior: false }).wait(100);
    }

    changeAttributeLabel(label: string) {
        this.selectConfiguration();
        cy.get(".s-attribute-display-form-button").click();
        cy.get("div:not(.is-selected).gd-list-item span").contains(label).click({ force: true });
        this.getDropdownElement().find(".s-save").click({ scrollBehavior: false });
        return this;
    }

    toggle() {
        this.getElement().click({ scrollBehavior: false });
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
        this.getShowAllButton().click().wait(100);
        return this;
    }

    addAttribute(name: string): AttributeFilter {
        this.dragAttributeToFilterBar();
        return new AttributeFilter(name).search(name).select();
    }

    moveAttributeFilter(fromIndex: number, toIndex: number, dropzone: DropZone) {
        const dataTransfer = new DataTransfer();
        cy.get(".s-attribute-filter").eq(fromIndex).trigger("dragstart", {
            dataTransfer,
        });
        cy.get(".dash-filters-notdate .s-attribute-filter")
            .eq(toIndex)
            .parents(".draggable-attribute-filter")
            .find(dropzone)
            .trigger("drop", {
                dataTransfer,
            });
        return this;
    }

    dragAttributeToFilterBar() {
        const dataTransfer = new DataTransfer();
        cy.get(NEW_ATTRIBUTE_FILTER_SELECTOR).trigger("dragstart", {
            dataTransfer,
        });

        cy.get(ATTRIBUTE_DROPZONE_SELECTOR).trigger("drop", {
            dataTransfer,
        });
        return this;
    }

    searchAttributeName(name: string) {
        new AttributeFilter(name).search(name);
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
}
