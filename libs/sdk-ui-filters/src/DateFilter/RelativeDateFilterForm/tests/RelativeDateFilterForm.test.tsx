// (C) 2019-2026 GoodData Corporation

import { type ReactElement } from "react";

import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { type DateFilterGranularity } from "@gooddata/sdk-model";
import { IntlWrapper } from "@gooddata/sdk-ui";

import { RelativeRangePicker as mockRelativeRangePicker } from "../../RelativeRangePicker/RelativeRangePicker.js";
import { GranularityTabs as mockGranularityTabs } from "../GranularityTabs.js";
import { type IRelativeDateFilterFormProps, RelativeDateFilterForm } from "../RelativeDateFilterForm.js";

vi.mock("../../RelativeRangePicker/RelativeRangePicker.js", async () => {
    const original = await vi.importActual("../../RelativeRangePicker/RelativeRangePicker.js");
    return {
        ...original,
        RelativeRangePicker: vi.fn(
            (original as { RelativeRangePicker: typeof mockRelativeRangePicker }).RelativeRangePicker,
        ),
    };
});

vi.mock("../GranularityTabs.js", async () => {
    const original = await vi.importActual("../GranularityTabs.js");
    return {
        ...original,
        GranularityTabs: vi.fn((original as { GranularityTabs: typeof mockGranularityTabs }).GranularityTabs),
    };
});

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
        onSelectedFilterOptionChange: () => {},
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
    beforeEach(async () => {
        // vi.restoreAllMocks() doesn't work with vi.fn(impl) - it sets implementation to undefined
        // We need to manually restore the original implementations
        const originalRangePicker = await vi.importActual<
            // oxlint-disable-next-line @typescript-eslint/consistent-type-imports
            typeof import("../../RelativeRangePicker/RelativeRangePicker.js")
        >("../../RelativeRangePicker/RelativeRangePicker.js");
        const originalTabs =
            // oxlint-disable-next-line @typescript-eslint/consistent-type-imports
            await vi.importActual<typeof import("../GranularityTabs.js")>("../GranularityTabs.js");

        vi.mocked(mockRelativeRangePicker).mockImplementation(originalRangePicker.RelativeRangePicker);
        vi.mocked(mockGranularityTabs).mockImplementation(originalTabs.GranularityTabs);
    });

    it("should render granularity tabs and relative range picker and pass them props", () => {
        vi.mocked(mockGranularityTabs).mockImplementation(() => null as unknown as ReactElement);
        vi.mocked(mockRelativeRangePicker).mockImplementation(() => null as unknown as ReactElement);
        createForm();

        expect(mockGranularityTabs).toHaveBeenCalledWith(
            expect.objectContaining({
                availableGranularities,
                selectedGranularity: relativeFormOption.granularity,
            }),
            undefined,
        );
        expect(mockRelativeRangePicker).toHaveBeenCalledWith(
            expect.objectContaining({
                selectedFilterOption: relativeFormOption,
            }),
            undefined,
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
