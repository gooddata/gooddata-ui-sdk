// (C) 2023 GoodData Corporation

import * as Navigation from "../../tools/navigation";
import { Widget } from "../../tools/widget";
import { EditMode } from "../../tools/editMode";
import { InsightsCatalog } from "../../tools/insightsCatalog";
import { DateFilter } from "../../tools/dateFilter";

const editMode = new EditMode();
const widget = new Widget(0);
const insightCatalog = new InsightsCatalog();

Cypress.Cookies.defaults({
    preserve: ["GDCAuthTT", "GDCAuthSTT", "_csrfToken"],
});

Cypress.on("uncaught:exception", (error) => {
    console.error("Uncaught exception cause", error);
    return false;
});

Cypress.Cookies.debug(true);

describe("Insights on dashboard", () => {
    before(() => {
        cy.login();

        Navigation.visit("dashboard/insight");
        editMode.isInEditMode(false).edit().isInEditMode();
    });

    //CL-10262: Save&Publish button is enabled right when selecting insight
    it("should disable save button if having no change", { tags: ["pre-merge_isolated_tiger"] }, () => {
        widget.waitChartLoaded().getChart();
        editMode.saveButtonEnabled(false);
    });

    it("has insight placeholder title", { tags: ["pre-merge_isolated_tiger"] }, () => {
        widget
            .waitChartLoaded()
            .getTitle()
            .then(($el) => {
                widget.hasPlaceholderTitle($el.text());
            });
    });

    it("shows a message if there is no data match", { tags: ["pre-merge_isolated_tiger"] }, () => {
        insightCatalog
            .waitForCatalogReload()
            .searchText('<a href="http://www.w3schools.com">Go!</a>')
            .hasNoDataMessage()
            .clearSearch();
    });

    it("should keep the panel after clearing search", () => {
        insightCatalog
            .waitForCatalogReload()
            .clickTab("all")
            .searchText("no data")
            .clearSearch()
            .tabIsActive("all", true);
    });

    it("Should show no data message if insight has no data", { tags: ["pre-merge_isolated_tiger"] }, () => {
        new DateFilter().open().selectAbsoluteForm().apply();
        widget.waitChartLoaded().getChart().hasNoDataForFilter();
    });

    it("(SEPARATE) can rename an existing insight", { tags: ["pre-merge_isolated_tiger"] }, () => {
        widget.waitChartLoaded();
        cy.fixture("widgetName").then((data) => {
            data.forEach((result: { widgetName: string }) => {
                widget.setTitle(result.widgetName).hasTitle(result.widgetName);
            });
        });

        editMode.save();
        widget.waitChartLoaded().hasTitle("<button>hello</button>");
    });
});
