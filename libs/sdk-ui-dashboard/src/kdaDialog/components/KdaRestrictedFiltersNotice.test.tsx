// (C) 2026 GoodData Corporation

import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { RawIntlProvider } from "react-intl";
import { describe, expect, it } from "vitest";

import { createInternalIntl } from "../../presentation/localization/createInternalIntl.js";

import { KdaRestrictedFiltersNotice } from "./KdaRestrictedFiltersNotice.js";

describe("KdaRestrictedFiltersNotice", () => {
    it("does not show a notice when no filters were restricted", () => {
        render(
            <RawIntlProvider value={createInternalIntl()}>
                <KdaRestrictedFiltersNotice count={0} />
            </RawIntlProvider>,
        );
        expect(screen.queryByTestId("kda-restricted-filters")).not.toBeInTheDocument();
    });

    it.each([
        [1, "1 restricted filter", "You don't have access to 1 filter, so the analysis does not use it."],
        [2, "2 restricted filters", "You don't have access to 2 filters, so the analysis does not use them."],
    ])("explains %s omitted filters on keyboard focus", async (count, label, reason) => {
        render(
            <RawIntlProvider value={createInternalIntl()}>
                <KdaRestrictedFiltersNotice count={count} />
            </RawIntlProvider>,
        );
        const user = userEvent.setup();

        expect(screen.getByText(label)).toBeInTheDocument();
        await user.tab();
        expect(screen.getByTestId("kda-restricted-filters")).toHaveFocus();
        expect(screen.getByRole("tooltip")).toHaveTextContent(reason);
        expect(screen.getByRole("tooltip")).toHaveTextContent(
            "Contact your administrator to request access.",
        );
        expect(screen.getByTestId("kda-restricted-filters")).toHaveAccessibleDescription(
            `${reason} Contact your administrator to request access.`,
        );
        expect(screen.queryByRole("button", { name: "Remove restricted filters" })).not.toBeInTheDocument();
    });
});
