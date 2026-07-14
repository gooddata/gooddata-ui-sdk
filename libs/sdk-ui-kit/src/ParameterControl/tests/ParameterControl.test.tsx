// (C) 2026 GoodData Corporation

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { type IParameterDefinition } from "@gooddata/sdk-model";
import { withIntl } from "@gooddata/sdk-ui";

import { ParameterControl } from "../ParameterControl.js";

const WrappedParameterControl = withIntl(ParameterControl);

const numberDefinition: IParameterDefinition = {
    type: "NUMBER",
    defaultValue: 10,
    constraints: { min: 0, max: 100 },
};

const stringDefinition: IParameterDefinition = {
    type: "STRING",
    defaultValue: "Actual",
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
