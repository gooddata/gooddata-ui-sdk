// (C) 2026 GoodData Corporation

import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { RawIntlProvider } from "react-intl";
import { describe, expect, it } from "vitest";

import { createInternalIntl } from "../../localization/createInternalIntl.js";

import { RestrictedFiltersPlaceholder } from "./RestrictedFiltersPlaceholder.js";

function renderPlaceholder(count: number) {
    return render(
        <RawIntlProvider value={createInternalIntl()}>
            <RestrictedFiltersPlaceholder count={count} />
        </RawIntlProvider>,
    );
}

describe("RestrictedFiltersPlaceholder", () => {
    it("reports how many filters were left out, never which", () => {
        renderPlaceholder(1);
        expect(screen.getByText("1 filter wasn't applied")).toBeInTheDocument();

        renderPlaceholder(3);
        expect(screen.getByText("3 filters weren't applied")).toBeInTheDocument();
    });

    it("gives the reason on focus, so it is reachable without a pointer", async () => {
        renderPlaceholder(2);

        await userEvent.setup().tab();

        expect(screen.getByRole("tooltip")).toHaveTextContent("You don't have access to 2 filters.");
    });
});
