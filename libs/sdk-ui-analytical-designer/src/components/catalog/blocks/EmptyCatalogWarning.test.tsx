// (C) 2021-2026 GoodData Corporation

import { render } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import { describe, expect, it } from "vitest";

import { TabNames } from "../model/catalogFilter.js";

import { EmptyCatalogWarning, type IEmptyCatalogWarningOwnProps } from "./EmptyCatalogWarning.js";

const translationsMock = {
    "catalog.no_attributes_available": "catalog.no_attributes_available",
    "catalog.no_measures_available": "catalog.no_measures_available",
    "catalog.no_data_items_available": "catalog.no_data_items_available",
    "catalog.workspace_contains_no_data": "catalog.workspace_contains_no_data",
    "catalog.no_related_attributes_found": "catalog.no_related_attributes_found",
    "catalog.no_related_measures_found": "catalog.no_related_measures_found",
    "catalog.no_related_data_items_found": "catalog.no_related_data_items_found",
    "catalog.workspace_contains_no_data.link": "catalog.workspace_contains_no_data.link",
};

const defaultProps = {
    hiddenItemsCount: 0,
    isWorkspaceEmpty: false,
    canManageProject: true,
    isFreemiumEdition: false,
    linkToDatasourcePage: "/data",
    selectedTabNames: TabNames.ALL_TAB_NAME,
};

const mountComponent = (props?: Partial<IEmptyCatalogWarningOwnProps>) =>
    render(
        <IntlProvider locale="en-US" messages={translationsMock}>
            <EmptyCatalogWarning {...defaultProps} {...props} />
        </IntlProvider>,
    );

describe("EmptyCatalogWarning", () => {
    it.each([
        ["catalog.no_data_items_available", {}, false],
        ["catalog.no_measures_available", { selectedTabNames: TabNames.MEASURES_TAB_NAME }, false],
        ["catalog.no_attributes_available", { selectedTabNames: TabNames.ATTRIBUTES_TAB_NAME }, false],
        ["catalog.no_related_data_items_found", { hiddenItemsCount: 1 }, false],
        [
            "catalog.no_related_measures_found",
            { hiddenItemsCount: 1, selectedTabNames: TabNames.MEASURES_TAB_NAME },
            false,
        ],
        [
            "catalog.no_related_attributes_found",
            { hiddenItemsCount: 1, selectedTabNames: TabNames.ATTRIBUTES_TAB_NAME },
            false,
        ],
        ["catalog.workspace_contains_no_data", { isWorkspaceEmpty: true, canManageProject: true }, true],
        ["catalog.no_data_items_available", { isWorkspaceEmpty: true, canManageProject: false }, false],
        [
            "catalog.no_measures_available",
            { isWorkspaceEmpty: true, canManageProject: false, selectedTabNames: TabNames.MEASURES_TAB_NAME },
            false,
        ],
        [
            "catalog.no_attributes_available",
            {
                isWorkspaceEmpty: true,
                canManageProject: false,
                selectedTabNames: TabNames.ATTRIBUTES_TAB_NAME,
            },
            false,
        ],
    ])(
        "should render warning message: %s",
        (
            expectedMessage: string,
            props: Partial<IEmptyCatalogWarningOwnProps>,
            hasEmptyWorkspaceClass: boolean,
        ) => {
            const { container } = mountComponent(props);
            const component = container.querySelector(".s-no-objects-found");

            expect(component.textContent).toContain(expectedMessage);
            expect(component.classList.contains("adi-no-objects-empty-workspace")).toBe(
                hasEmptyWorkspaceClass,
            );
        },
    );

    it("should not display link when workspace has no data and cant manage data", () => {
        const { container } = mountComponent({
            isWorkspaceEmpty: true,
            canManageProject: false,
        });
        expect(container.querySelector(".s-catalog-no-data-link")).toBeFalsy();
    });

    it("should not display link when workspace has no data and it is not freemium edition", () => {
        const { container } = mountComponent({
            isWorkspaceEmpty: true,
            canManageProject: true,
            isFreemiumEdition: false,
        });
        expect(container.querySelector(".s-catalog-no-data-link")).toBeFalsy();
    });

    it("should display link when workspace has no data and it is freemium edition", () => {
        const { container } = mountComponent({
            isWorkspaceEmpty: true,
            canManageProject: true,
            isFreemiumEdition: true,
        });
        expect(container.querySelectorAll(".s-catalog-no-data-link")).toBeTruthy();
    });
});
