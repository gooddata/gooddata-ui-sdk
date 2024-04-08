// (C) 2021-2024 GoodData Corporation
import * as Navigation from "../../tools/navigation";
import { Headline } from "../../tools/headline";

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
];

// Can be removed once migrated to tiger or once decided that we don't want to migrate the test.
// eslint-disable-next-line jest/no-disabled-tests
describe.skip("Headline drilling", { tags: ["pre-merge_isolated_bear"] }, () => {
    beforeEach(() => {
        Navigation.visit("visualizations/headline/headline-drilling");
    });

    scenarios.forEach((item) => {
        it(`should work with ${item.label} predicate`, () => {
            const headline = new Headline(".s-visualization-chart");
            headline.waitLoaded();
            pressButton(item.id);

            cy.get(lastEventSelector).should("have.text", "null");

            headline.clickPrimaryValue();
            cy.get(lastEventSelector).contains(/Won/);
        });
    });
});
