// (C) 2019-2025 GoodData Corporation
import React from "react";

import { fireEvent, render, screen } from "@testing-library/react";
import noop from "lodash/noop.js";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { DateFilterGranularity } from "@gooddata/sdk-model";
import { IntlWrapper } from "@gooddata/sdk-ui";

import * as rangePickerModule from "../../RelativeRangePicker/RelativeRangePicker.js";
import * as granularityTabsModule from "../GranularityTabs.js";
import { IRelativeDateFilterFormProps, RelativeDateFilterForm } from "../RelativeDateFilterForm.js";

const availableGranularities: DateFilterGranularity[] = [
    "GDC.time.date",
    "GDC.time.month",
    "GDC.time.quarter",
    "GDC.time.year",
];

const relativeFormOption: IRelativeDateFilterFormProps["selectedFilterOption"] = {
    type: "relativeForm",
    localIdentifier: "relativeForm",
    granularity: availableGranularities[0],
    name: "",
    visible: true,
};

const createForm = (props?: Partial<IRelativeDateFilterFormProps>) => {
    const defaultProps: IRelativeDateFilterFormProps = {
        availableGranularities,
        onSelectedFilterOptionChange: noop,
        selectedFilterOption: relativeFormOption,
        isMobile: false,
    };
    return render(
        <IntlWrapper locale="en-US">
            <RelativeDateFilterForm {...defaultProps} {...props} />
        </IntlWrapper>,
    );
};

/**
 * These mocks enable us to test props as parameters of the called components
 */
// vi.mock("../GranularityTabs", () => ({
//     GranularityTabs: vi.fn(() => null),
// }));
// vi.mock("../../RelativeRangePicker/RelativeRangePicker", () => ({
//     RelativeRangePicker: vi.fn(() => null),
// }));

describe("RelativeDateFilterForm", () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    it("should render granularity tabs and relative range picker and pass them props", () => {
        const granularityTabsMock = vi
            .spyOn(granularityTabsModule, "GranularityTabs")
            .mockImplementation((): null => null);
        const rangePickerMock = vi
            .spyOn(rangePickerModule, "RelativeRangePicker")
            .mockImplementation((): null => null);
        createForm();

        expect(granularityTabsMock).toHaveBeenCalledWith(
            expect.objectContaining({
                availableGranularities,
                selectedGranularity: relativeFormOption.granularity,
            }),
            {},
        );
        expect(rangePickerMock).toHaveBeenCalledWith(
            expect.objectContaining({
                selectedFilterOption: relativeFormOption,
            }),
            {},
        );
    });

    it('should render "from" and "to" inputs', () => {
        createForm();
        expect(screen.getAllByPlaceholderText("Type or select").length).toBe(2);
    });

    it("should fire onSelectedFilterOptionChange when granularity or inputs change", () => {
        const onSelectedFilterOptionChange = vi.fn();
        createForm({ onSelectedFilterOptionChange });

        fireEvent.click(screen.getByText("Years"));
        expect(onSelectedFilterOptionChange).toHaveBeenLastCalledWith({
            granularity: "GDC.time.year",
            localIdentifier: "relativeForm",
            type: "relativeForm",
            name: "",
            visible: true,
        });

        fireEvent.change(screen.getAllByPlaceholderText("Type or select")[1], { target: { value: "2" } });
        fireEvent.click(screen.getByText("2 days ahead"));

        expect(onSelectedFilterOptionChange).toHaveBeenLastCalledWith({
            granularity: "GDC.time.date",
            localIdentifier: "relativeForm",
            type: "relativeForm",
            to: 2,
            name: "",
            visible: true,
        });

        fireEvent.change(screen.getAllByPlaceholderText("Type or select")[0], { target: { value: "-3" } });
        fireEvent.click(screen.getByText("3 days ago"));

        expect(onSelectedFilterOptionChange).toHaveBeenLastCalledWith({
            granularity: "GDC.time.date",
            localIdentifier: "relativeForm",
            type: "relativeForm",
            from: -3,
            name: "",
            visible: true,
        });
    });
});
