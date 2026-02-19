// (C) 2026 GoodData Corporation

import { fireEvent, render, screen } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import { describe, expect, it, vi } from "vitest";

import { EmptyValuesHandlingToggle } from "../EmptyValuesHandlingToggle.js";

describe("EmptyValuesHandlingToggle", () => {
    it("should render include label and call onChange", () => {
        const onChange = vi.fn();

        render(
            <IntlProvider
                locale="en-US"
                messages={{
                    "filters.emptyValuesHandling.include": "Include empty values",
                    "filters.emptyValuesHandling.exclude": "Exclude empty values",
                }}
            >
                <EmptyValuesHandlingToggle mode="include" checked={false} onChange={onChange} />
            </IntlProvider>,
        );

        expect(screen.getByText("Include empty values")).toBeInTheDocument();
        fireEvent.click(screen.getByRole("checkbox"));
        expect(onChange).toHaveBeenCalledWith(true);
    });

    it("should render exclude label", () => {
        render(
            <IntlProvider
                locale="en-US"
                messages={{
                    "filters.emptyValuesHandling.include": "Include empty values",
                    "filters.emptyValuesHandling.exclude": "Exclude empty values",
                }}
            >
                <EmptyValuesHandlingToggle mode="exclude" checked onChange={vi.fn()} />
            </IntlProvider>,
        );

        expect(screen.getByText("Exclude empty values")).toBeInTheDocument();
    });
});
