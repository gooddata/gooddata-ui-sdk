// (C) 2019-2025 GoodData Corporation

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { type DateFilterGranularity } from "@gooddata/sdk-model";
import { withIntl } from "@gooddata/sdk-ui";

import { GranularityTabs, type IGranularityTabsProps } from "../GranularityTabs.js";

const granularityTuple: Array<[DateFilterGranularity, string]> = [
    ["GDC.time.date", "Days"],
    ["GDC.time.week_us", "Weeks"],
    ["GDC.time.month", "Months"],
    ["GDC.time.quarter", "Quarters"],
    ["GDC.time.year", "Years"],
];

const availableGranularities: DateFilterGranularity[] = granularityTuple.map((tuple) => tuple[0]);

const granularityNames: string[] = granularityTuple.map((tuple) => tuple[1]);

const createTabs = (props?: Partial<IGranularityTabsProps>) => {
    const defaultProps: IGranularityTabsProps = {
        availableGranularities,
        onSelectedGranularityChange: () => {},
        selectedGranularity: "GDC.time.date",
    };
    const Wrapped = withIntl(GranularityTabs);
    return render(<Wrapped {...defaultProps} {...props} />);
};

describe("GranularityTabs", () => {
    describe("should render", () => {
        it.each(granularityNames)("a tab %s", (granularity: string) => {
            createTabs();
            expect(screen.getByText(granularity)).toBeInTheDocument();
        });
    });

    describe("should fire onSelectedGranularityChange", () => {
        const onSelectedGranularityChange = vi.fn();
        it.each(granularityTuple)(
            "with parameter %s when tab %s is clicked",
            (value: string, name: string) => {
                createTabs({
                    onSelectedGranularityChange,
                });
                const tab = screen.getByText(name);
                fireEvent.click(tab);
                expect(onSelectedGranularityChange).toHaveBeenLastCalledWith(value);
            },
        );
    });

    describe("should highlight selectedGranularity", () => {
        it.each(
            // reversed so that the first value is not selected by default
            [...granularityTuple].reverse(),
        )("%s", (value: DateFilterGranularity, name: string) => {
            createTabs({ selectedGranularity: value });

            expect(screen.getByText(name)).toHaveClass("is-active");
        });
    });
});
