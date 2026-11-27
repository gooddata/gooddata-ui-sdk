// (C) 2026 GoodData Corporation

import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { type ICatalogAttribute, idRef } from "@gooddata/sdk-model";

import { useDashboardSelector } from "../../../../model/react/DashboardStoreProvider.js";
import { selectInsightsMap } from "../../../../model/store/insights/insightsSelectors.js";
import { selectAllInsightWidgets } from "../../../../model/store/tabs/layout/layoutSelectors.js";
import { IntlWrapper } from "../../../localization/IntlWrapper.js";

import { AttributesDropdown } from "./AttributesDropdown.js";

vi.mock("../../../../model/react/DashboardStoreProvider.js", async (importOriginal) => {
    const original = await importOriginal();
    return {
        ...(original as object),
        useDashboardSelector: vi.fn(),
    };
});

vi.mock("./attributeListItemTooltip/AttributeListItemTooltip.js", () => ({
    AttributeListItemTooltip: () => null,
}));

const createAttribute = (id: string, title: string): ICatalogAttribute =>
    ({
        type: "attribute",
        attribute: { id, title, ref: idRef(id, "attribute") },
        defaultDisplayForm: { ref: idRef(`${id}.df`, "displayForm") },
        displayForms: [],
        geoPinDisplayForms: [],
        groups: [],
    }) as unknown as ICatalogAttribute;

const attributes = [
    createAttribute("account", "Account"),
    createAttribute("opportunity", "Opportunity"),
    createAttribute("stage", "Stage Name"),
];

// computed attributes are listed adapted to catalog attributes; only their ref keeps the computedAttribute type
const createComputedAttribute = (id: string, title: string): ICatalogAttribute =>
    ({
        type: "attribute",
        attribute: { id, title, ref: idRef(id, "computedAttribute") },
        defaultDisplayForm: { ref: idRef(id, "displayForm") },
        displayForms: [],
        geoPinDisplayForms: [],
        groups: [],
    }) as unknown as ICatalogAttribute;

function renderDropdown(onSelect = vi.fn(), items = attributes) {
    render(
        <IntlWrapper>
            <div>
                <h3 id="filters-title">Filters</h3>
                <AttributesDropdown
                    attributes={items}
                    dateDatasets={[]}
                    onSelect={onSelect}
                    accessibilityConfig={{ ariaLabelledBy: "filters-title", searchAriaLabel: "Search" }}
                />
            </div>
        </IntlWrapper>,
    );
    return onSelect;
}

const getSearch = async () => {
    const combobox = await screen.findByRole("combobox", { name: "Search" });
    // the autofocus waits for a visible overlay, which jsdom never reports
    combobox.focus();
    return combobox;
};

describe("AttributesDropdown", () => {
    beforeEach(() => {
        vi.mocked(useDashboardSelector).mockImplementation(((selector: unknown) => {
            if (selector === selectAllInsightWidgets) {
                return [];
            }
            if (selector === selectInsightsMap) {
                return new Map();
            }
            return false;
        }) as typeof useDashboardSelector);
    });

    it("exposes the attributes as named options of a labelled listbox", async () => {
        renderDropdown();
        const combobox = await getSearch();
        const listbox = screen.getByRole("listbox", { name: "Filters" });

        expect(combobox).toHaveAttribute("aria-controls", listbox.id);

        const options = screen.getAllByRole("option");
        expect(options).toHaveLength(3);
        expect(new Set(options.map((option) => option.id)).size).toBe(3);
        expect(options[0]).toHaveAccessibleName("Account");
        expect(options[0]).toHaveAttribute("aria-posinset", "1");
        expect(options[0]).toHaveAttribute("aria-setsize", "3");
    });

    it("moves the active option with the arrow keys and adds the announced attribute on Enter", async () => {
        const onSelect = renderDropdown();
        const combobox = await getSearch();

        await userEvent.keyboard("{ArrowDown}");
        expect(combobox).toHaveAttribute("aria-activedescendant", screen.getAllByRole("option")[0].id);

        await userEvent.keyboard("{ArrowDown}");
        const activeOption = screen.getAllByRole("option")[1];
        expect(combobox).toHaveAttribute("aria-activedescendant", activeOption.id);
        expect(activeOption).toHaveAccessibleName("Opportunity");

        await userEvent.keyboard("{Enter}");
        expect(onSelect).toHaveBeenCalledWith(attributes[1].defaultDisplayForm.ref, "attribute");
    });

    it("gives computed attributes option ids distinct from attributes with the same identifier", async () => {
        const computedAttribute = createComputedAttribute("account", "Account (computed)");
        const onSelect = renderDropdown(vi.fn(), [attributes[0], computedAttribute]);
        const combobox = await getSearch();

        const options = screen.getAllByRole("option");
        expect(options).toHaveLength(2);
        expect(options[0].id).not.toBe(options[1].id);
        expect(options[1]).toHaveAccessibleName("Account (computed)");

        await userEvent.keyboard("{ArrowDown}{ArrowDown}");
        expect(combobox).toHaveAttribute("aria-activedescendant", options[1].id);

        await userEvent.keyboard("{Enter}");
        expect(onSelect).toHaveBeenCalledWith(computedAttribute.defaultDisplayForm.ref, "attribute");
    });
});
