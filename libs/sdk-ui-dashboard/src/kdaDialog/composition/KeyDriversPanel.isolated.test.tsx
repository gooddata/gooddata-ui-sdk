// (C) 2026 GoodData Corporation

import { render, screen } from "@testing-library/react";
import { RawIntlProvider } from "react-intl";
import { describe, expect, it, vi } from "vitest";

import { createInternalIntl } from "../../presentation/localization/createInternalIntl.js";
import { type IKdaState } from "../internalTypes.js";
import { KdaStateProvider } from "../providers/KdaState.js";

import { KeyDriversPanel } from "./KeyDriversPanel.js";

vi.mock("../hooks/useTrendDrivers.js", () => ({
    useTrendDrivers: () => ({ trendUp: [], trendDown: [] }),
}));

const state = {
    selectedTrend: "all",
    trendDropdownOpen: true,
} as unknown as Partial<IKdaState>;

describe("KeyDriversPanel", () => {
    it("names the trend list box by the panel title only once", () => {
        render(
            <RawIntlProvider value={createInternalIntl()}>
                <KdaStateProvider value={state}>
                    <KeyDriversPanel detailsId="details" />
                </KdaStateProvider>
            </RawIntlProvider>,
        );

        // The overlay is not positioned in jsdom, so its content counts as hidden for role queries.
        const listbox = screen.getByRole("listbox", { hidden: true });

        const labelIds = listbox.getAttribute("aria-labelledby")?.split(/\s+/) ?? [];
        expect(labelIds).toHaveLength(1);

        const labelElement = document.getElementById(labelIds[0]);
        expect(labelElement).toHaveTextContent(/^Key drivers$/);
        // The help button next to the title is named "Key drivers" too; it must not be part of the label,
        // otherwise screen readers announce "Key drivers Key drivers".
        expect(labelElement?.querySelector("button, [aria-label]")).toBeNull();
        expect(listbox).toHaveAccessibleName("Key drivers");
    });
});
