// (C) 2022 GoodData Corporation
export class Headline {
    hasValue(value: string): this {
        cy.get(".s-dash-item.viz-type-headline .s-headline-value").should("have.text", value);
        return this;
    }

    noValue(): this {
        cy.get(".s-dash-item.viz-type-headline .s-headline-value", { timeout: 50000 }).should("not.exist");
        return this;
    }
}
