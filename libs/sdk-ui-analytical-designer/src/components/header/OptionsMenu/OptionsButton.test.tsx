// (C) 2007-2026 GoodData Corporation

import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { withIntl } from "../../../utils/with_intl.js";

import { DefaultOptions } from "./OptionsButton.js";

describe("DefaultOptions", () => {
    it("toggles the menu on click", () => {
        const Wrapped = withIntl(DefaultOptions);
        const { getByText } = render(
            <Wrapped
                layout={{ mode: "legacy", isCatalogCollapsed: false, canCollapseCatalog: false }}
                workspace="workspace"
                title=""
                hasUnsavedChanges={false}
                label="⋯"
                accessibleName="More options"
                isDisabled={false}
                items={[
                    {
                        type: "action",
                        id: "changeTimezone",
                        label: "Zone",
                        isDisabled: false,
                        onSelect: () => {},
                    },
                ]}
            />,
        );

        fireEvent.click(getByText("⋯"));
        expect(document.querySelector(".s-gd-export-menu-overlay")).toBeInTheDocument();

        fireEvent.click(getByText("⋯"));
        expect(document.querySelector(".s-gd-export-menu-overlay")).not.toBeInTheDocument();
    });
});
