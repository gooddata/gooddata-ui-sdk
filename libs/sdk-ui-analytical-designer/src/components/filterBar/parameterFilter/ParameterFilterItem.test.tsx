// (C) 2026 GoodData Corporation

import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { idRef } from "@gooddata/sdk-model";

import { updateParameterFilter } from "../../../store/filter_bar/parameter_filter_actions.js";
import { type IParameterFilter } from "../../../store/filter_bar/parameter_filter_types.js";
import { withIntl } from "../../../utils/with_intl.js";

import { ParameterFilterItem } from "./ParameterFilterItem.js";

vi.hoisted(() => {
    vi.resetModules();
});

const dispatchMock = vi.hoisted(() => vi.fn());

vi.mock("react-redux", async () => {
    const actual = await vi.importActual<Record<string, unknown>>("react-redux");
    return {
        ...actual,
        useDispatch: () => dispatchMock,
    };
});

const Wrapped = withIntl(ParameterFilterItem);

const numberFilter: IParameterFilter = {
    type: "parameter",
    localIdentifier: "p1",
    parameterRef: idRef("threshold", "parameter"),
    name: "Threshold",
    value: 25,
    definition: { type: "NUMBER", defaultValue: 10, constraints: { min: 0, max: 100 } },
};

const stringFilter: IParameterFilter = {
    type: "parameter",
    localIdentifier: "p2",
    parameterRef: idRef("scenario", "parameter"),
    name: "Scenario",
    value: "Actual",
    definition: { type: "STRING", defaultValue: "Actual", constraints: { maxLength: 10 } },
};

const constrainedFilter: IParameterFilter = {
    type: "parameter",
    localIdentifier: "p3",
    parameterRef: idRef("scenarioEnum", "parameter"),
    name: "Scenario",
    value: "budget",
    definition: {
        type: "STRING",
        defaultValue: "actual",
        constraints: {
            allowedValues: [
                { value: "actual", title: "Actual" },
                { value: "budget", title: "Budget Plan" },
                { value: "forecast", title: "Forecast" },
            ],
        },
    },
};

function getChip(filter: IParameterFilter) {
    return screen.getByRole("button", { name: new RegExp(`^${filter.name} `) });
}

function renderOpened(filter: IParameterFilter) {
    render(<Wrapped filter={filter} />);
    fireEvent.click(getChip(filter));
}

const getInput = () => screen.getByTestId<HTMLInputElement>("parameter-control-dropdown-input");

const getApplyButton = () => screen.getByTestId("parameter-control-dropdown-apply");

const getResetButton = () => screen.getByTestId("parameter-control-dropdown-reset");

describe("ParameterFilterItem", () => {
    beforeEach(() => {
        dispatchMock.mockReset();
    });

    it("opens a control configured from the filter definition", () => {
        renderOpened(numberFilter);

        const input = getInput();
        expect(input.value).toBe("25");
        expect(input.min).toBe("0");
        expect(input.max).toBe("100");
    });

    it("applies the edited value to the filter and closes the dropdown", () => {
        renderOpened(numberFilter);

        fireEvent.change(getInput(), { target: { value: "42" } });
        fireEvent.click(getApplyButton());

        expect(dispatchMock).toHaveBeenCalledWith(updateParameterFilter({ ...numberFilter, value: 42 }));
        expect(screen.queryByTestId("parameter-control-dropdown-input")).toBeNull();
    });

    it("edits a STRING parameter as free text and applies the typed value unchanged", () => {
        renderOpened(stringFilter);

        fireEvent.change(getInput(), { target: { value: "Optimistic" } });
        fireEvent.click(getApplyButton());

        expect(dispatchMock).toHaveBeenCalledWith(
            updateParameterFilter({ ...stringFilter, value: "Optimistic" }),
        );
    });

    it("resets the draft to the definition default", () => {
        renderOpened({ ...stringFilter, value: "Optimistic" });

        fireEvent.click(getResetButton());

        expect(getInput().value).toBe("Actual");
    });

    it("shows the allowed value title on the chip for a constrained STRING parameter", () => {
        render(<Wrapped filter={constrainedFilter} />);

        expect(getChip(constrainedFilter)).toHaveAccessibleName("Scenario is Budget Plan");
    });

    it("shows the reset warning on the chip when the value is out of range", async () => {
        render(<Wrapped filter={{ ...numberFilter, value: 500 }} />);

        act(() => {
            getChip(numberFilter).focus();
        });

        expect(await screen.findByRole("tooltip")).toHaveTextContent(
            "The original value is out of range, so the default is applied until you set a valid value.",
        );
    });

    it("shows no warning on the chip when the value is valid", () => {
        render(<Wrapped filter={numberFilter} />);

        expect(getChip(numberFilter)).not.toHaveAttribute("aria-describedby");
    });

    it("applies the clicked allowed value as its raw value, not its title", async () => {
        renderOpened(constrainedFilter);

        fireEvent.click(await screen.findByText("Forecast"));

        expect(dispatchMock).toHaveBeenCalledWith(
            updateParameterFilter({ ...constrainedFilter, value: "forecast" }),
        );
    });
});
