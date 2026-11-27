// (C) 2026 GoodData Corporation

import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { RawIntlProvider } from "react-intl";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createInternalIntl } from "../../localization/createInternalIntl.js";

import { useResetFiltersButton } from "./hooks/useResetFiltersButton.js";
import { ResetFiltersButton } from "./ResetFiltersButton.js";

vi.mock("./hooks/useResetFiltersButton.js", () => ({
    useResetFiltersButton: vi.fn(),
}));

const mockedUseResetFiltersButton = vi.mocked(useResetFiltersButton);

function renderButton() {
    return render(
        <RawIntlProvider value={createInternalIntl()}>
            <button type="button">Date range</button>
            <ResetFiltersButton />
        </RawIntlProvider>,
    );
}

describe("ResetFiltersButton", () => {
    const resetFilters = vi.fn();

    beforeEach(() => {
        resetFilters.mockReset();
        mockedUseResetFiltersButton.mockReturnValue({ canReset: true, resetType: "all", resetFilters });
    });

    it("is a named native button that is not a separate Tab stop", async () => {
        renderButton();
        const user = userEvent.setup();

        await user.tab();
        await user.tab();

        const button = screen.getByRole("button", { name: "Reset all to defaults" });
        expect(button).not.toHaveFocus();
        expect(button).toHaveAttribute("type", "button");
        expect(button).toHaveAttribute("tabindex", "-1");
    });

    it.each(["{Enter}", " "])("resets the filters on %s", async (key) => {
        renderButton();
        const user = userEvent.setup();

        screen.getByRole("button", { name: "Reset all to defaults" }).focus();
        await user.keyboard(key);

        expect(resetFilters).toHaveBeenCalledTimes(1);
    });

    it("is not rendered when there is nothing to reset", () => {
        mockedUseResetFiltersButton.mockReturnValue({ canReset: false, resetType: "all", resetFilters });
        renderButton();

        expect(screen.queryByRole("button", { name: "Reset all to defaults" })).not.toBeInTheDocument();
    });
});
