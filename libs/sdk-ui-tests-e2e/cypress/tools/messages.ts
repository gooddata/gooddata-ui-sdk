// (C) 2021-2022 GoodData Corporation

export class Messages {
    hasSuccessMessage(text: string) {
        cy.get(".s-message.success").should("contain.text", text);
        return this;
    }

    hasProgressMessage(expect: boolean) {
        cy.get(".s-message.progress").should(expect ? "exist" : "not.exist");
        return this;
    }
}
