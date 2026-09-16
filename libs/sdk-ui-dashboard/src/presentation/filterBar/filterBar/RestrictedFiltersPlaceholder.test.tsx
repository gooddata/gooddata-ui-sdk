// (C) 2026 GoodData Corporation

import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { RawIntlProvider } from "react-intl";
import { describe, expect, it, vi } from "vitest";

import { createInternalIntl } from "../../localization/createInternalIntl.js";

import { RestrictedFiltersPlaceholder } from "./RestrictedFiltersPlaceholder.js";

function renderPlaceholder(count: number, onRemove?: () => void) {
    return render(
        <RawIntlProvider value={createInternalIntl()}>
            <RestrictedFiltersPlaceholder count={count} onRemove={onRemove} />
        </RawIntlProvider>,
    );
}

describe("RestrictedFiltersPlaceholder", () => {
    it("reports how many filters were left out, never which", () => {
        renderPlaceholder(1);
        expect(screen.getByText("1 restricted filter")).toBeInTheDocument();

        renderPlaceholder(3);
        expect(screen.getByText("3 restricted filters")).toBeInTheDocument();
    });

    it("reaches the remove action by keyboard alone", async () => {
        const onRemove = vi.fn();
        renderPlaceholder(1, onRemove);
        const user = userEvent.setup();

        await user.tab();
        await user.keyboard("{Enter}");

        expect(screen.getByRole("button", { name: "Remove restricted filters" })).toHaveFocus();

        await user.keyboard("{Enter}");

        expect(onRemove).toHaveBeenCalledTimes(1);
    });

    it("hands the focus to the next control before it disappears", async () => {
        const onRemove = vi.fn();
        render(
            <RawIntlProvider value={createInternalIntl()}>
                <RestrictedFiltersPlaceholder count={1} onRemove={onRemove} />
                <button type="button">Date filter</button>
            </RawIntlProvider>,
        );
        const user = userEvent.setup();

        await user.tab();
        await user.keyboard("{Enter}");
        await user.keyboard("{Enter}");

        expect(onRemove).toHaveBeenCalledTimes(1);
        expect(screen.getByRole("button", { name: "Date filter" })).toHaveFocus();
    });

    it("becomes a dialog only when the action is asked for, and lets the keyboard leave again", async () => {
        renderPlaceholder(1, vi.fn());
        const user = userEvent.setup();

        await user.tab();
        expect(screen.getByRole("tooltip")).toBeInTheDocument();

        await user.keyboard("{Enter}");
        expect(screen.getByRole("dialog", { name: "1 restricted filter" })).toBeInTheDocument();

        await user.tab();
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
        expect(screen.getByTestId("restricted-filters")).toHaveFocus();
    });

    it("gives the reason on focus, so it is reachable without a pointer", async () => {
        renderPlaceholder(2);

        await userEvent.setup().tab();

        expect(screen.getByRole("tooltip")).toHaveTextContent(
            "You don't have access to 2 filters. Contact your administrator to request access.",
        );
    });
});
