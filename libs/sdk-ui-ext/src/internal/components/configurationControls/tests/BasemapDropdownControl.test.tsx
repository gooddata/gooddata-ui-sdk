// (C) 2026 GoodData Corporation

import { render, screen, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { InternalIntlWrapper } from "../../../utils/internalIntlProvider.js";
import { BasemapDropdownControl } from "../BasemapDropdownControl.js";

describe("BasemapDropdownControl", () => {
    it("clears basemap, legacy tileset, and color scheme when default basemap is selected", async () => {
        const pushData = vi.fn();

        render(
            <InternalIntlWrapper>
                <BasemapDropdownControl
                    valuePath="basemap"
                    labelText="properties.map.basemap.title"
                    properties={{
                        controls: {
                            tileset: "satellite",
                            colorScheme: "dark",
                        },
                    }}
                    pushData={pushData}
                    showSatelliteBasemapOption
                />
            </InternalIntlWrapper>,
        );

        await userEvent.click(screen.getByRole("combobox"));
        await userEvent.click(within(screen.getByTestId("gd-dropdown-list")).getByText("default"));

        expect(pushData).toHaveBeenCalledWith({
            properties: {
                controls: {
                    colorScheme: undefined,
                    basemap: undefined,
                    tileset: undefined,
                },
            },
        });
    });

    it("keeps the persisted hidden satellite basemap visible in the dropdown", () => {
        render(
            <InternalIntlWrapper>
                <BasemapDropdownControl
                    valuePath="basemap"
                    labelText="properties.map.basemap.title"
                    value="satellite"
                    showSatelliteBasemapOption={false}
                />
            </InternalIntlWrapper>,
        );

        expect(screen.getByRole("combobox")).toHaveTextContent("satellite");
    });
});
