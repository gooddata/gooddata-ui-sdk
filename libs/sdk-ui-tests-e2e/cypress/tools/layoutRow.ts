// (C) 2021 GoodData Corporation

export class LayoutRow {
    constructor(private rowIndex: number) {}

    getSelector() {
        return `.s-fluid-layout-row:nth-child(${this.rowIndex + 1})`;
    }

    getElement() {
        return cy.get(this.getSelector());
    }

    getItems() {
        return this.getElement().find(".s-dash-item");
    }

    hasWidgets(count: number) {
        this.getItems().should("have.length", count);
        return this;
    }

    hasTitles(titles: string[]) {
        this.hasWidgets(titles.length);

        titles.forEach((title, itemIndex) => {
            this.getItems().eq(itemIndex).find(".s-headline").should("have.text", title);
        });

        return this;
    }
}
