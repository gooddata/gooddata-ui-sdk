// (C) 2021-2024 GoodData Corporation
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

// Can be removed once migrated to tiger or once decided that we don't want to migrate the test.
// eslint-disable-next-line jest/no-disabled-tests
describe.skip("BarChart drilling", { tags: ["pre-merge_isolated_bear"] }, () => {
    beforeEach(() => {
        Navigation.visit("visualizations/barchart/bar-chart-drilling-scenario");
    });

    scenarios.forEach((item) => {
        it(`should work with ${item.label} predicate (SEPARATE)`, () => {
            const chart = new Chart(".s-visualization-chart");
            chart.waitLoaded();
            pressButton(item.id);

            cy.get(lastEventSelector).should("have.text", "null");

            chart.clickSeriesPoint(1, 0);

            cy.get(lastEventSelector).contains(/CompuSci/);
        });
    });
});
