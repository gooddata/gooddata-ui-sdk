// (C) 2019 GoodData Corporation
import * as React from "react";
import { shallow } from "enzyme";
import noop = require("lodash/noop");
import { ExtendedDateFilters } from "../../interfaces/ExtendedDateFilters";

import { GranularityTabs, IGranularityTabsProps } from "../GranularityTabs";
import { clickOn } from "../../tests/utils";
import { GranularityIntlKey } from "../../constants/i18n";

const granularityTuple: Array<[ExtendedDateFilters.DateFilterGranularity, GranularityIntlKey]> = [
    ["GDC.time.date", "day"],
    ["GDC.time.week_us", "week"],
    ["GDC.time.month", "month"],
    ["GDC.time.quarter", "quarter"],
    ["GDC.time.year", "year"],
];

const availableGranularities: ExtendedDateFilters.DateFilterGranularity[] = granularityTuple.map(
    tuple => tuple[0],
);

const classGranularities: GranularityIntlKey[] = granularityTuple.map(tuple => tuple[1]);

const createTabs = (props?: Partial<IGranularityTabsProps>) => {
    const defaultProps: IGranularityTabsProps = {
        availableGranularities,
        onSelectedGranularityChange: noop,
        selectedGranularity: "GDC.time.date",
    };
    return shallow(<GranularityTabs {...defaultProps} {...props} />);
};

describe("GranularityTabs", () => {
    describe("should render", () => {
        const rendered = createTabs();
        it.each(classGranularities)("a tab %s", (classGranularity: string) => {
            expect(rendered).toContainExactlyOneMatchingElement(`.s-granularity-${classGranularity}`);
        });
    });

    describe("should fire onSelectedGranularityChange", () => {
        const onSelectedGranularityChange = jest.fn();
        const rendered = createTabs({
            onSelectedGranularityChange,
        });
        it.each(granularityTuple)(
            "with parameter %s when tab %s is clicked",
            (granularity: string, classGranularity: string) => {
                const tab = rendered.find(`.s-granularity-${classGranularity}`);
                clickOn(tab);
                expect(onSelectedGranularityChange).toHaveBeenLastCalledWith(granularity);
            },
        );
    });

    describe("should highlight selectedGranularity", () => {
        const onSelectedGranularityChange = jest.fn();
        const rendered = createTabs({
            onSelectedGranularityChange,
        });
        it.each(
            // reversed so that the first value is not selected by default
            [...granularityTuple].reverse(),
        )("%s", (granularity: string, classGranularity: string) => {
            rendered.setProps({ selectedGranularity: granularity });
            const tab = rendered.find(`.s-granularity-${classGranularity}`);
            expect(tab).toHaveProp("selected", true);
        });
    });
});
