// (C) 2022-2024 GoodData Corporation

import * as Navigation from "../../tools/navigation";
import { EditMode } from "../../tools/editMode";
import { AttributeFilter, FilterBar } from "../../tools/filterBar";
import { DashboardMenu } from "../../tools/dashboardMenu";
import { Dashboard } from "../../tools/dashboards";
import { Widget } from "../../tools/widget";
import { getProjectId } from "../../support/constants";

const dashboard = new Dashboard();
const editMode = new EditMode();
const filterBar = new FilterBar();
const widget = new Widget(0);
const stageName = new AttributeFilter("Stage Name");
const product = new AttributeFilter("Product");
const account = new AttributeFilter("Account");
const isWon = new AttributeFilter("Is Won?");

// Can be removed once migrated to tiger or once decided that we don't want to migrate the test.
// eslint-disable-next-line jest/no-disabled-tests
describe.skip("Dashboard dependent filter", { tags: ["pre-merge_isolated_bear"] }, () => {
    it("Apply dependence filter on Edit Mode", () => {
        Navigation.visit("dashboard/stage-name");
        editMode.edit();

        widget.waitTableLoaded();
        filterBar.addAttribute("Product");

        product.configureBearFilterDependency("Stage Name").close();

        stageName.open().selectAllValues().apply();
        product
            .waitFilteringFinished()
            .open()
            .isAttributeItemFiltered(false)
            .getValueList()
            .should("deep.equal", [
                "CompuSci",
                "Educationly",
                "Explorer",
                "Grammar Plus",
                "PhoenixSoft",
                "TouchAll",
                "WonderKid",
            ]);

        stageName.open().selectAttributeWithoutSearch("Conviction");
        product
            .waitFilteringFinished()
            .open()
            .isAttributeItemFiltered(true)
            .getValueList()
            .should("deep.equal", [
                "CompuSci",
                "Educationly",
                "Explorer",
                "Grammar Plus",
                "PhoenixSoft",
                "WonderKid",
            ]);
    });

    it("Apply dependence filter on View Mode", () => {
        Navigation.visit("dashboard/dependent-filter");
        widget.waitTableLoaded();

        account.open().selectAttributeWithoutSearch(".decimal");
        stageName
            .waitFilteringFinished()
            .open()
            .isAttributeItemFiltered(true)
            .getValueList()
            .should("deep.equal", ["Closed Won", "Closed Lost"]);

        isWon.open().isAttributeItemFiltered(true).selectAttributeWithoutSearch("false");

        stageName
            .waitFilteringFinished()
            .open()
            .isAttributeItemFiltered(true)
            .getValueList()
            .should("deep.equal", ["Closed Lost"]);
    });

    it("Remove parent filter", () => {
        Navigation.visit("dashboard/dependent-filter");
        editMode.edit();
        widget.waitTableLoaded();

        account.open().selectAttributeWithoutSearch(".decimal");
        stageName
            .waitFilteringFinished()
            .open()
            .isAttributeItemFiltered(true)
            .getValueList()
            .should("have.length", 2);

        account.removeFilter();
        stageName.waitFilteringFinished();
        new Widget(0).waitTableLoaded();
        stageName.open().isAttributeItemFiltered(false).getValueList().should("have.length", 8);
    });

    it("Reset after change mode to edit or view", () => {
        Navigation.visit("dashboard/dependent-filter-set");

        filterBar.hasAttributeFiltersWithValue([
            ["Account", "1-800 We Answer"],
            ["Stage Name", "Closed Won"],
            ["Is Won?", "true"],
        ]);

        account.open().selectAttributeWithoutSearch("1-800 Postcards");

        filterBar.hasAttributeFiltersWithValue([
            ["Account", "1-800 Postcards"],
            ["Stage Name", "All"],
            ["Is Won?", "All"],
        ]);

        editMode.edit().isInEditMode();

        filterBar.hasAttributeFiltersWithValue([
            ["Account", "1-800 We Answer"],
            ["Stage Name", "Closed Won"],
            ["Is Won?", "true"],
        ]);

        account.open().selectAttributeWithoutSearch("1-800 Postcards");

        filterBar.hasAttributeFiltersWithValue([
            ["Account", "1-800 Postcards"],
            ["Stage Name", "All"],
            ["Is Won?", "All"],
        ]);

        editMode.cancel().discard();

        filterBar.hasAttributeFiltersWithValue([
            ["Account", "1-800 We Answer"],
            ["Stage Name", "Closed Won"],
            ["Is Won?", "true"],
        ]);
    });

    it("Reset after parent filter change", () => {
        Navigation.visit("dashboard/dependent-filter-set");

        editMode.edit().isInEditMode();

        stageName.open().configureBearFilterDependency(["Account", "Is Won?"]);

        stageName
            .getValueList()
            .should("deep.equal", [
                "Interest",
                "Discovery",
                "Short List",
                "Risk Assessment",
                "Conviction",
                "Negotiation",
                "Closed Won",
                "Closed Lost",
            ]);
    });

    it("Do not refresh after update again", () => {
        Navigation.visit("dashboard/dependent-filter-set");

        account.open().selectAttributesWithoutApply("1-800 Postcards");

        filterBar.hasAttributeFiltersWithValue([
            ["Account", "1-800 We Answer"],
            ["Stage Name", "Closed Won"],
            ["Is Won?", "true"],
        ]);

        account.getSelectedValueList().should("deep.equal", ["1-800 Postcards"]);
    });

    it("Send reset dasboard command ", () => {
        Navigation.visit("dashboard/commands");

        filterBar.hasAttributeFiltersWithValue([
            ["Account", "1-800 We Answer"],
            ["Stage Name", "Closed Won"],
            ["Is Won?", "true"],
        ]);

        account.open().selectAttributeWithoutSearch("1-800 Postcards");

        filterBar.hasAttributeFiltersWithValue([
            ["Account", "1-800 Postcards"],
            ["Stage Name", "All"],
            ["Is Won?", "All"],
        ]);

        dashboard.getElement(".s-button-command.reset-dashboard").click();

        filterBar.hasAttributeFiltersWithValue([
            ["Account", "1-800 We Answer"],
            ["Stage Name", "Closed Won"],
            ["Is Won?", "true"],
        ]);
    });

    it("(SEPARATE) Export on View Mode", () => {
        cy.intercept("POST", "**/exportDashboard").as("exportDashboard");
        Navigation.visit("dashboard/dependent-filter");
        widget.waitTableLoaded();

        account.open().selectAttributeWithoutSearch(".decimal");
        isWon.open().selectAttributeWithoutSearch("false");
        stageName.waitFilteringFinished();

        new DashboardMenu().toggle().clickOption("Export to PDF");

        cy.wait("@exportDashboard")
            .its("request.body.dashboardExport.filters")
            .should("deep.equal", [
                {
                    dateFilter: {
                        type: "absolute",
                        granularity: "GDC.time.year",
                    },
                },
                {
                    attributeFilter: {
                        displayForm: `/gdc/md/${getProjectId()}/obj/1057`,
                        negativeSelection: false,
                        attributeElements: [`/gdc/md/${getProjectId()}/obj/1056/elements?id=2870`],
                    },
                },
                {
                    attributeFilter: {
                        displayForm: `/gdc/md/${getProjectId()}/obj/1091`,
                        negativeSelection: true,
                        attributeElements: [],
                    },
                },
                {
                    attributeFilter: {
                        displayForm: `/gdc/md/${getProjectId()}/obj/1096`,
                        negativeSelection: false,
                        attributeElements: [`/gdc/md/${getProjectId()}/obj/1095/elements?id=460493`],
                    },
                },
            ]);
    });
});
