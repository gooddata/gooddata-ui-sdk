// (C) 2026 GoodData Corporation

import { render, screen } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import { describe, expect, it, vi } from "vitest";

import { OtherPresetsSection } from "./OtherPresetsSection.js";

const emptyValuesOption = {
    localIdentifier: "EMPTY_VALUES",
    type: "emptyValues",
    visible: true,
    name: "",
} as const;

describe("OtherPresetsSection", () => {
    it("should not render when enableEmptyDateValues is false", () => {
        render(
            <IntlProvider
                locale="en-US"
                messages={{
                    "filters.other.heading": "Other",
                    "filters.emptyValues.title": "Empty values",
                }}
            >
                <OtherPresetsSection
                    filterOptions={{ emptyValues: emptyValuesOption }}
                    selectedFilterOption={emptyValuesOption}
                    onSelectedFilterOptionChange={vi.fn()}
                    isMobile={false}
                    enableEmptyDateValues={false}
                />
            </IntlProvider>,
        );

        expect(screen.queryByText("Other")).toBeNull();
        expect(screen.queryByText("Empty values")).toBeNull();
    });

    it("should render when enableEmptyDateValues is true and option is present", () => {
        render(
            <IntlProvider
                locale="en-US"
                messages={{
                    "filters.other.heading": "Other",
                    "filters.emptyValues.title": "Empty values",
                }}
            >
                <OtherPresetsSection
                    filterOptions={{ emptyValues: emptyValuesOption }}
                    selectedFilterOption={emptyValuesOption}
                    onSelectedFilterOptionChange={vi.fn()}
                    isMobile={false}
                    enableEmptyDateValues
                />
            </IntlProvider>,
        );

        expect(screen.getByText("Other")).toBeInTheDocument();
        expect(screen.getByText("Empty values")).toBeInTheDocument();
    });

    it("should expose the Empty values option inside a group labelled by the Other heading", () => {
        render(
            <IntlProvider
                locale="en-US"
                messages={{
                    "filters.other.heading": "Other",
                    "filters.emptyValues.title": "Empty values",
                }}
            >
                <div role="listbox" aria-label="Select a date range">
                    <OtherPresetsSection
                        filterOptions={{ emptyValues: emptyValuesOption }}
                        selectedFilterOption={emptyValuesOption}
                        onSelectedFilterOptionChange={vi.fn()}
                        isMobile={false}
                        enableEmptyDateValues
                    />
                </div>
            </IntlProvider>,
        );

        const group = screen.getByRole("group", { name: "Other" });
        const option = screen.getByRole("option", { name: "Empty values" });
        expect(group).toContainElement(option);
    });
});
