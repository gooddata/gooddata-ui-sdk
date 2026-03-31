// (C) 2026 GoodData Corporation

import { render, screen, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { type IDropdownItem } from "../../../interfaces/Dropdown.js";
import { InternalIntlWrapper } from "../../../utils/internalIntlProvider.js";
import { BasemapDropdownControl } from "../BasemapDropdownControl.js";

const TEST_ITEMS: IDropdownItem[] = [
    { title: "default", value: "default" },
    { title: "satellite", value: "satellite" },
];

describe("BasemapDropdownControl", () => {
    it("clears basemap and legacy tileset when default basemap is selected", async () => {
        const pushData = vi.fn();

        render(
            <InternalIntlWrapper>
                <BasemapDropdownControl
                    items={TEST_ITEMS}
                    properties={{
                        controls: {
                            tileset: "satellite",
                        },
                    }}
                    pushData={pushData}
                />
            </InternalIntlWrapper>,
        );

        await userEvent.click(screen.getByRole("combobox"));
        await userEvent.click(within(screen.getByTestId("gd-dropdown-list")).getByText("default"));

        expect(pushData).toHaveBeenCalledWith({
            properties: {
                controls: {
                    basemap: undefined,
                    tileset: undefined,
                },
            },
        });
    });

    it("keeps the persisted satellite basemap visible in the dropdown", () => {
        render(
            <InternalIntlWrapper>
                <BasemapDropdownControl value="satellite" items={TEST_ITEMS} />
            </InternalIntlWrapper>,
        );

        expect(screen.getByRole("combobox")).toHaveTextContent("satellite");
    });
});
