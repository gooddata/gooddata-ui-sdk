// (C) 2026 GoodData Corporation

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { type IDropdownItem } from "../../../interfaces/Dropdown.js";
import { InternalIntlWrapper } from "../../../utils/internalIntlProvider.js";
import { BasemapDropdownControl } from "../BasemapDropdownControl.js";

const TEST_ITEMS: IDropdownItem[] = [
    { title: "Standard", value: "standard" },
    { title: "Satellite", value: "satellite" },
];

describe("BasemapDropdownControl", () => {
    it("shows the first item as fallback when no value is set", () => {
        render(
            <InternalIntlWrapper>
                <BasemapDropdownControl items={TEST_ITEMS} />
            </InternalIntlWrapper>,
        );

        expect(screen.getByRole("combobox")).toHaveTextContent("Standard");
    });

    it("shows the persisted basemap value", () => {
        render(
            <InternalIntlWrapper>
                <BasemapDropdownControl value="satellite" items={TEST_ITEMS} />
            </InternalIntlWrapper>,
        );

        expect(screen.getByRole("combobox")).toHaveTextContent("Satellite");
    });
});
