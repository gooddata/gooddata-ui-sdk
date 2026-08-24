// (C) 2026 GoodData Corporation

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { withIntl } from "@gooddata/sdk-ui";

import { type ITimezoneSelectProps, TimezoneSelect } from "./TimezoneSelect.js";

const DEFAULT_PROPS: ITimezoneSelectProps = {
    onChange: () => {},
    searchPlaceholder: "Search time zones",
    ariaLabel: "Time zone",
    noMatchLabel: "No match",
};

function renderSelect(props: Partial<ITimezoneSelectProps> = {}) {
    const Wrapped = withIntl<ITimezoneSelectProps>(TimezoneSelect);
    return render(<Wrapped {...DEFAULT_PROPS} {...props} />);
}

function openDropdown() {
    fireEvent.click(screen.getByRole("combobox"));
}

describe("TimezoneSelect search accessibility", () => {
    it("renders a polite status region for search results", async () => {
        renderSelect();
        openDropdown();

        const status = await screen.findByRole("status");
        expect(status).toHaveAttribute("aria-live", "polite");
        // no announcement before the user searches
        expect(status).toBeEmptyDOMElement();
    });

    it("announces the number of matches after a search", async () => {
        renderSelect();
        openDropdown();

        fireEvent.change(await screen.findByRole("textbox"), { target: { value: "Prague" } });

        // the announcement is debounced to let screen readers finish reading typed letters
        await waitFor(
            () => {
                expect(screen.getByRole("status").textContent).toBe("1 result: Prague");
            },
            { timeout: 3000 },
        );
    });

    it("announces when the search has no results", async () => {
        renderSelect();
        openDropdown();

        fireEvent.change(await screen.findByRole("textbox"), { target: { value: "xxxxxx" } });

        await waitFor(
            () => {
                expect(screen.getByRole("status").textContent).toBe("No results match.");
            },
            { timeout: 3000 },
        );
    });
});
