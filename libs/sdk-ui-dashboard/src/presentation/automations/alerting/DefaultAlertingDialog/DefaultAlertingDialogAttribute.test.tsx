// (C) 2026 GoodData Corporation

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
    type IAttribute,
    type IAttributeDisplayFormMetadataObject,
    type ICatalogAttribute,
    areObjRefsEqual,
    idRef,
    newAttribute,
} from "@gooddata/sdk-model";

import { IntlWrapper } from "../../../localization/IntlWrapper.js";
import { type AttributeValue } from "../hooks/useAttributeValuesFromExecResults.js";
import { type AlertAttribute, type IAlertingDialogAttributeProps } from "../types.js";

import { DefaultAlertingDialogAttribute } from "./DefaultAlertingDialogAttribute.js";

const MENU_ITEM_TITLE_SELECTOR = ".gd-ui-kit-menu__item-title";
const SELECTED_ITEM_SELECTOR = ".gd-ui-kit-menu__item--isSelected";

const NAME_VALUES: AttributeValue[] = [
    { title: "Global Region", value: "/elements?id=1", name: "Global Region" },
    { title: "Happy Country", value: "/elements?id=2", name: "Happy Country" },
];

const LABEL_VALUES: AttributeValue[] = [
    { title: "Worldwide", value: "/elements?id=3", name: "Worldwide" },
    { title: "Empty Country Region", value: "/elements?id=4", name: "Empty Country Region" },
];

function displayFormMd(id: string, title: string): IAttributeDisplayFormMetadataObject {
    return {
        type: "displayForm",
        id,
        uri: `/${id}`,
        ref: idRef(id, "displayForm"),
        title,
        description: "",
        attribute: idRef("country", "attribute"),
        production: true,
        deprecated: false,
        unlisted: false,
    };
}

const NAME_DF = displayFormMd("country.name", "Country name");
const LABEL_DF = displayFormMd("country.label", "Country label");

// One attribute, two display forms; its own title differs from both so the title fallback is observable.
const CATALOG_ATTRIBUTE: ICatalogAttribute = {
    type: "attribute",
    attribute: {
        type: "attribute",
        id: "country",
        uri: "/country",
        ref: idRef("country", "attribute"),
        title: "Country",
        description: "",
        production: true,
        deprecated: false,
        unlisted: false,
        displayForms: [NAME_DF, LABEL_DF],
    },
    defaultDisplayForm: NAME_DF,
    displayForms: [NAME_DF, LABEL_DF],
    geoPinDisplayForms: [],
    groups: [],
};

// Unaliased, as AD authors them: the row title has to come from the display form, not the shared attribute.
const BY_NAME: AlertAttribute = {
    attribute: newAttribute(NAME_DF.ref, (a) => a.localId("a_name")),
    type: "attribute",
};

const BY_LABEL: AlertAttribute = {
    attribute: newAttribute(LABEL_DF.ref, (a) => a.localId("a_label")),
    type: "attribute",
};

function valuesByDisplayForm(attribute: IAttribute): AttributeValue[] {
    return areObjRefsEqual(attribute.attribute.displayForm, LABEL_DF.ref) ? LABEL_VALUES : NAME_VALUES;
}

function renderAttributeSelect(overrides?: Partial<IAlertingDialogAttributeProps>) {
    const onAttributeChange = vi.fn();
    render(
        <IntlWrapper>
            <DefaultAlertingDialogAttribute
                id="attribute-select"
                selectedAttribute={undefined}
                selectedValue={undefined}
                onAttributeChange={onAttributeChange}
                attributes={[BY_NAME, BY_LABEL]}
                catalogAttributes={[CATALOG_ATTRIBUTE]}
                catalogDateDatasets={[]}
                getAttributeValues={valuesByDisplayForm}
                {...overrides}
            />
        </IntlWrapper>,
    );
    return { onAttributeChange };
}

function openDropdown() {
    fireEvent.click(screen.getByRole("combobox"));
}

// The overlay stays `visibility: hidden` without layout: role queries need `hidden`, names resolve via text.
function menuItem(title: string) {
    return screen.getByText(title, { selector: MENU_ITEM_TITLE_SELECTOR }).closest("[role='menuitem']")!;
}

function menuItems() {
    return screen.getAllByRole("menuitem", { hidden: true });
}

function menuItemTitles() {
    return menuItems().map((item) => item.textContent);
}

function selectedMenuItemTitles() {
    return menuItems()
        .filter((item) => item.querySelector(SELECTED_ITEM_SELECTOR))
        .map((item) => item.textContent);
}

describe("DefaultAlertingDialogAttribute", () => {
    it("titles each display form of one attribute by its own name, not the attribute's", () => {
        renderAttributeSelect();

        openDropdown();

        expect(menuItemTitles()).toEqual(["All", "Country name", "Country label"]);
    });

    it("prefers the alias the insight authored over the display form title", () => {
        const aliased: AlertAttribute = {
            ...BY_LABEL,
            attribute: newAttribute(LABEL_DF.ref, (a) => a.localId("a_label").alias("Region")),
        };
        renderAttributeSelect({ attributes: [BY_NAME, aliased] });

        openDropdown();

        expect(menuItemTitles()).toEqual(["All", "Country name", "Region"]);
    });

    it("names the picked display form on the closed control", () => {
        renderAttributeSelect({ selectedAttribute: BY_LABEL });

        expect(screen.getByRole("combobox")).toHaveTextContent("Country label / All");
    });

    it("opens the values of the picked display form without repeating the attribute item", () => {
        renderAttributeSelect();
        openDropdown();

        fireEvent.click(menuItem("Country name"));

        expect(menuItemTitles()).toEqual(["All (2)", "Global Region", "Happy Country"]);
    });

    it("offers each display form its own values", () => {
        renderAttributeSelect();
        openDropdown();

        fireEvent.click(menuItem("Country label"));

        expect(menuItemTitles()).toEqual(["All (2)", "Worldwide", "Empty Country Region"]);
    });

    it("reports the display form the value was picked under", () => {
        const { onAttributeChange } = renderAttributeSelect();
        openDropdown();

        fireEvent.click(menuItem("Country label"));
        fireEvent.click(menuItem("Worldwide"));

        expect(onAttributeChange).toHaveBeenCalledWith(BY_LABEL, LABEL_VALUES[0]);
    });

    it("marks only the selected display form, not its sibling of the same attribute", () => {
        renderAttributeSelect({ selectedAttribute: BY_LABEL, selectedValue: LABEL_VALUES[0].value });

        openDropdown();

        expect(selectedMenuItemTitles()).toEqual(["Country label"]);
    });
});
