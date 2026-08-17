// (C) 2026 GoodData Corporation

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { type IParameterDefinition } from "@gooddata/sdk-model";
import { withIntlForTest } from "@gooddata/sdk-ui";

import { ParameterControl } from "../ParameterControl.js";

const WrappedParameterControl = withIntlForTest(ParameterControl);

const numberDefinition: IParameterDefinition = {
    type: "NUMBER",
    defaultValue: 10,
    constraints: { min: 0, max: 100 },
};

const stringDefinition: IParameterDefinition = {
    type: "STRING",
    defaultValue: "Actual",
};

const enumDefinition: IParameterDefinition = {
    type: "STRING",
    defaultValue: "Actual",
    constraints: { allowedValues: [{ value: "Actual", title: "Actual results" }, { value: "Plan" }] },
};

const getInput = () => screen.getByTestId("parameter-control-dropdown-input");
const getApply = () => screen.getByTestId("parameter-control-dropdown-apply");

describe("ParameterControl", () => {
    it("renders the number control for a NUMBER definition", () => {
        render(
            <WrappedParameterControl
                name="Threshold"
                definition={numberDefinition}
                value={25}
                onApply={() => {}}
                onCancel={() => {}}
            />,
        );
        expect(getInput()).toHaveAttribute("type", "number");
        expect(getInput()).toHaveValue(25);
    });

    it("renders the string control for a STRING definition", () => {
        render(
            <WrappedParameterControl
                name="Scenario"
                definition={stringDefinition}
                value="Budget"
                onApply={() => {}}
                onCancel={() => {}}
            />,
        );
        expect(getInput()).toHaveProperty("type", "text");
        expect(getInput()).toHaveValue("Budget");
    });

    it("renders the enum control for a STRING definition with allowedValues", () => {
        render(
            <WrappedParameterControl
                name="Scenario"
                definition={enumDefinition}
                value="Actual"
                onApply={() => {}}
                onCancel={() => {}}
            />,
        );
        expect(screen.getByTestId("parameter-control-allowed-values-dropdown")).toBeInTheDocument();
        expect(screen.queryByTestId("parameter-control-dropdown-input")).not.toBeInTheDocument();
    });

    it("suffixes the enum row matching resetValue, not the definition default", async () => {
        render(
            <WrappedParameterControl
                name="Scenario"
                definition={enumDefinition}
                value="Actual"
                resetValue="Plan"
                onApply={() => {}}
                onCancel={() => {}}
            />,
        );
        const options = await screen.findAllByRole("option");
        expect(options.map((option) => option.textContent?.includes("(Default)"))).toEqual([false, true]);
    });

    it("suffixes the enum row matching the definition default when there is no resetValue", async () => {
        render(
            <WrappedParameterControl
                name="Scenario"
                definition={enumDefinition}
                value="Plan"
                onApply={() => {}}
                onCancel={() => {}}
            />,
        );
        const options = await screen.findAllByRole("option");
        expect(options.map((option) => option.textContent?.includes("(Default)"))).toEqual([true, false]);
    });

    it("suffixes no enum row when resetValue matches none of the allowed values", async () => {
        render(
            <WrappedParameterControl
                name="Scenario"
                definition={enumDefinition}
                value="Actual"
                resetValue="Forecast"
                onApply={() => {}}
                onCancel={() => {}}
            />,
        );
        const options = await screen.findAllByRole("option");
        expect(options.map((option) => option.textContent?.includes("(Default)"))).toEqual([false, false]);
    });

    it("renders the free-text control for a STRING definition with an empty allowedValues list", () => {
        render(
            <WrappedParameterControl
                name="Scenario"
                definition={{ type: "STRING", defaultValue: "Actual", constraints: { allowedValues: [] } }}
                value="Budget"
                onApply={() => {}}
                onCancel={() => {}}
            />,
        );
        expect(getInput()).toHaveValue("Budget");
        expect(screen.queryByTestId("parameter-control-allowed-values-dropdown")).not.toBeInTheDocument();
    });

    it("applies a numeric value through the number control", () => {
        const onApply = vi.fn();
        render(
            <WrappedParameterControl
                name="Threshold"
                definition={numberDefinition}
                value={25}
                onApply={onApply}
                onCancel={() => {}}
            />,
        );
        fireEvent.change(getInput(), { target: { value: "42" } });
        fireEvent.click(getApply());
        expect(onApply).toHaveBeenCalledWith(42);
    });

    it("applies free text through the string control", () => {
        const onApply = vi.fn();
        render(
            <WrappedParameterControl
                name="Scenario"
                definition={stringDefinition}
                value="Actual"
                onApply={onApply}
                onCancel={() => {}}
            />,
        );
        fireEvent.change(getInput(), { target: { value: "Forecast" } });
        fireEvent.click(getApply());
        expect(onApply).toHaveBeenCalledWith("Forecast");
    });

    it("enforces the NUMBER definition constraints in the number control", () => {
        render(
            <WrappedParameterControl
                name="Threshold"
                definition={numberDefinition}
                value={25}
                onApply={() => {}}
                onCancel={() => {}}
            />,
        );
        fireEvent.change(getInput(), { target: { value: "999" } });
        expect(getApply()).toBeDisabled();
    });
});
