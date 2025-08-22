// (C) 2021-2025 GoodData Corporation

export class Messages {
    hasSuccessMessage(text: string) {
        cy.get(".gd-messages .s-message.success").should("contain.text", text);
        return this;
    }

    hasProgressMessage(expect: boolean) {
        cy.get(".gd-messages .s-message.information", { timeout: 40000 }).should(
            expect ? "exist" : "not.exist",
        );
        return this;
    }

    getWarningMessage() {
        return cy.get(".gd-messages .s-message.warning");
    }

    hasWarningMessage(expect: boolean) {
        this.getWarningMessage().should(expect ? "exist" : "not.exist");
        return this;
    }

    clickShowMore() {
        this.getWarningMessage().find(".s-message-text-showmorelink").should("be.visible").click();
        return this;
    }

    hasInsightNameIsBolder(expected: boolean, insightName: string) {
        this.getWarningMessage()
            .find(".s-message-text-content b")
            .should(expected ? "have.text" : "not.have.text", insightName);
    }
}
