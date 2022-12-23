// (C) 2021 GoodData Corporation

import { LayoutRow } from "./layoutRow";

export class SectionHeader {
    constructor(private rowIndex: number) {}

    getElement() {
        return new LayoutRow(this.rowIndex).getElement();
    }

    getTitleElement() {
        return this.getElement().find(".s-fluid-layout-row-title");
    }

    getDescriptionElement() {
        return this.getElement().find(".s-fluid-layout-row-description");
    }

    hasTitle(expect = true) {
        this.getTitleElement().should(expect ? "exist" : "not.exist");
        return this;
    }

    hasDescription(expect = true) {
        this.getDescriptionElement().should(expect ? "exist" : "not.exist");
        return this;
    }

    hasTitleWithText(text: string) {
        this.getTitleElement().should("have.text", text);
        return this;
    }

    hasDescriptionWithText(text: string) {
        this.getDescriptionElement().should("have.text", text);
        return this;
    }

    getTitleInputWrapper() {
        return this.getElement().find(".s-fluid-layout-row-title-input");
    }

    setTitle(text: string) {
        this.getTitleInputWrapper().click().find("textarea").type(`${text}{enter}`, { delay: 50 });
        return this;
    }

    getDescriptionInputWrapper() {
        return this.getElement().find(".s-fluid-layout-row-description-input");
    }

    setDescription(text: string) {
        this.getDescriptionInputWrapper().click().find("textarea").type(`${text}{enter}`, { delay: 50 });
        return this;
    }
}
