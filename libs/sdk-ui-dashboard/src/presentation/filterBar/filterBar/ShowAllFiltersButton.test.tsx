// (C) 2026 GoodData Corporation

import { useState } from "react";

import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { RawIntlProvider } from "react-intl";
import { describe, expect, it } from "vitest";

import { createInternalIntl } from "../../localization/createInternalIntl.js";

import { ShowAllFiltersButton } from "./ShowAllFiltersButton.js";

function StatefulShowAllFiltersButton() {
    const [isExpanded, setIsExpanded] = useState(false);
    return <ShowAllFiltersButton isVisible isFilterBarExpanded={isExpanded} onToggle={setIsExpanded} />;
}

function renderButton() {
    return render(
        <RawIntlProvider value={createInternalIntl()}>
            <button type="button">My views</button>
            <StatefulShowAllFiltersButton />
        </RawIntlProvider>,
    );
}

describe("ShowAllFiltersButton", () => {
    it("is a Tab stop exposed as a collapsed button named Show all", async () => {
        renderButton();
        const user = userEvent.setup();

        await user.tab();
        await user.tab();

        const button = screen.getByRole("button", { name: "Show all" });
        expect(button).toHaveFocus();
        expect(button).toHaveAttribute("aria-expanded", "false");
        expect(button).not.toHaveAttribute("aria-hidden");
    });

    it("toggles with Enter and Space and keeps focus on the same button", async () => {
        renderButton();
        const user = userEvent.setup();

        const button = screen.getByRole("button", { name: "Show all" });
        button.focus();

        await user.keyboard("{Enter}");
        expect(screen.getByRole("button", { name: "Show less" })).toBe(button);
        expect(button).toHaveAttribute("aria-expanded", "true");
        expect(button).toHaveFocus();

        await user.keyboard(" ");
        expect(screen.getByRole("button", { name: "Show all" })).toBe(button);
        expect(button).toHaveAttribute("aria-expanded", "false");
        expect(button).toHaveFocus();
    });

    it("renders nothing when not visible", () => {
        render(
            <RawIntlProvider value={createInternalIntl()}>
                <ShowAllFiltersButton isVisible={false} isFilterBarExpanded={false} onToggle={() => {}} />
            </RawIntlProvider>,
        );
        expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });
});
