// (C) 2021 GoodData Corporation
import * as Navigation from "../../tools/navigation";
import { Chart } from "../../tools/chart";

const pressButton = (buttonName: string) => {
    cy.get(`.s-${buttonName}-button`).click();
};

const lastEventSelector = ".s-last-event";

const scenarios = [
    {
        id: "localId-measure-drilling",
        label: "localId measure drilling",
    },
    {
        id: "identifier-measure-drilling",
        label: "identifier measure drilling",
    },
    {
        id: "localId-attribute-drilling",
        label: "localId attribute drilling",
    },
    {
        id: "identifier-attribute-drilling",
        label: "identifier attribute drilling",
    },
];

describe("BarChart drilling", () => {
    before(() => {
        cy.login();

        Navigation.visit("visualizations/barchart/bar-chart-drilling-scenario");
    });

    scenarios.forEach((item) => {
        it(`should work with ${item.label} predicate (SEPARATE)`, () => {
            const chart = new Chart(".s-visualization-chart");
            chart.waitLoaded();
            pressButton(item.id);

            cy.wait(100);

            cy.get(lastEventSelector).should("have.text", "null");

            chart.clickSeriesPoint(0, 0);

            cy.wait(100);
            cy.get(lastEventSelector).contains(/CompuSci/);
        });
    });
});
