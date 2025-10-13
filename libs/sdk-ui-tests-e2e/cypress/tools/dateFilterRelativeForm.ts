// (C) 2021-2025 GoodData Corporation

type Granularity = "day" | "month" | "quarter" | "year";

export class DateFilterRelativeForm {
    granularitySelected(granularity: Granularity): this {
        this.getElement(`.s-granularity-${granularity}`).should("have.class", "is-active");
        return this;
    }

    selectTab(granularity: Granularity) {
        this.getElement(`.s-granularity-${granularity}`).click();
        return this;
    }

    openFromRangePicker(): this {
        this.getElement(".s-relative-range-picker-from").click();
        return this;
    }

    rangePickerFromHasValueSelected(value: string): this {
        this.getElement(".s-relative-date-filter-option")
            .contains(value)
            .should("have.class", "s-select-item-focused");
        return this;
    }

    rangePickerFromHasValue(value: string): this {
        this.getElement(".s-relative-range-picker-from")
            .find(".s-relative-range-input")
            .should("have.value", value);
        return this;
    }

    rangePickerSelectOption(option: string): this {
        this.getElement(".s-relative-date-filter-option").contains(option).click();
        return this;
    }

    pressKey(key: string): this {
        this.getElement(".s-relative-range-picker-from").type(`{${key}}`);
        return this;
    }

    typeIntoFromInput(value: string): this {
        this.getElement(".s-relative-range-picker-from").find(".s-relative-range-input").clear().type(value);
        return this;
    }

    typeIntoToInput(value: string): this {
        this.getElement(".s-relative-range-picker-to").find(".s-relative-range-input").clear().type(value);
        return this;
    }

    focusToRangePicker(): this {
        this.getElement(".s-relative-range-picker-to").find(".s-relative-range-input").focus();
        return this;
    }

    rangePickerToFocused(): this {
        this.getElement(".s-relative-range-picker-to").find(".s-relative-range-input").should("be.focused");
        return this;
    }

    /**
     * Chainable
     */
    private getElement(selector: string): Cypress.Chainable {
        return cy.get(selector);
    }
}
