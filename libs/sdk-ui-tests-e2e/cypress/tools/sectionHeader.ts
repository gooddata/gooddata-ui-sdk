// (C) 2021-2024 GoodData Corporation
export class SectionHeader {
    constructor(private rowIndex: number) {}

    getSelector() {
        return `.s-fluid-layout-row:nth-child(${this.rowIndex + 1})`;
    }

    getElement() {
        return cy.get(this.getSelector());
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
        this.getTitleInputWrapper().click().find("textarea").type(`${text}{enter}`);
        return this;
    }

    getDescriptionInputWrapper() {
        return this.getElement().find(".s-fluid-layout-row-description-input");
    }

    setDescription(text: string) {
        const textField = this.getDescriptionInputWrapper().click().find("textarea");
        const length = text.length - 1;
        const value = text.substring(0, length);
        const last = text[length];

        textField.wait(500);
        textField.invoke("val", value);
        textField.type(last, { parseSpecialCharSequences: false, delay: 100 });
        this.clickOutside();
        return this;
    }

    hasPlaceholderTitle(text: string) {
        this.getTitleInputWrapper().should("have.text", text);
        return this;
    }

    hasPlaceholderDescription(text: string) {
        this.getDescriptionInputWrapper().should("have.text", text);
        return this;
    }

    selectTitleInput() {
        this.getTitleInputWrapper().click();
        return this;
    }

    selectDescriptionInput() {
        this.getDescriptionInputWrapper().click("center");
        return this;
    }

    hasLimitMessage(expected: boolean, message: string) {
        cy.get(".bubble:not(.s-gd-configuration-bubble) .bubble-content .content").should(
            expected ? "have.text" : "not.exist",
            message,
        );
        return this;
    }

    clickOutside() {
        this.getTitleInputWrapper().click("left").type("{esc}");
        return this;
    }

    scrollIntoView() {
        this.getElement().scrollIntoView();
        return this;
    }
}
