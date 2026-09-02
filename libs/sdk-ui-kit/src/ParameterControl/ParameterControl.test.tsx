// (C) 2026 GoodData Corporation

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { type IParameterDefinition } from "@gooddata/sdk-model";
import { withIntlForTest } from "@gooddata/sdk-ui";

import { ParameterControl } from "./ParameterControl.js";

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

const constrainedStringDefinition: IParameterDefinition = {
    type: "STRING",
    defaultValue: "Actual",
    constraints: { minLength: 3 },
};

const enumDefinition: IParameterDefinition = {
    type: "STRING",
    defaultValue: "Actual",
    constraints: { allowedValues: [{ value: "Actual", title: "Actual results" }, { value: "Plan" }] },
};

const commit = (onCommit = vi.fn(), onClose = vi.fn()) => ({ mode: "commit" as const, onCommit, onClose });
const staged = (onStage = vi.fn(), onClose = vi.fn()) => ({ mode: "staged" as const, onStage, onClose });

const getInput = () => screen.getByTestId("parameter-control-dropdown-input");
const getApply = () => screen.getByTestId("parameter-control-dropdown-apply");
const getClose = () => screen.getByTestId("parameter-control-dropdown-close");
const getReset = () => screen.getByTestId("parameter-control-dropdown-reset");
const getStepperUp = () => screen.getByTestId("parameter-control-dropdown-input-stepper-up");

describe("ParameterControl", () => {
    describe("variant dispatch", () => {
        it("renders the number control for a NUMBER definition", () => {
            render(
                <WrappedParameterControl
                    name="Threshold"
                    definition={numberDefinition}
                    value={25}
                    {...commit()}
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
                    {...commit()}
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
                    {...commit()}
                />,
            );
            expect(screen.getByTestId("parameter-control-allowed-values-dropdown")).toBeInTheDocument();
            expect(screen.queryByTestId("parameter-control-dropdown-input")).not.toBeInTheDocument();
        });

        it("renders the free-text control for a STRING definition with an empty allowedValues list", () => {
            render(
                <WrappedParameterControl
                    name="Scenario"
                    definition={{
                        type: "STRING",
                        defaultValue: "Actual",
                        constraints: { allowedValues: [] },
                    }}
                    value="Budget"
                    {...commit()}
                />,
            );
            expect(getInput()).toHaveValue("Budget");
            expect(screen.queryByTestId("parameter-control-allowed-values-dropdown")).not.toBeInTheDocument();
        });
    });

    describe("enum default suffix", () => {
        it("suffixes the enum row matching resetValue, not the definition default", async () => {
            render(
                <WrappedParameterControl
                    name="Scenario"
                    definition={enumDefinition}
                    value="Actual"
                    resetValue="Plan"
                    {...commit()}
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
                    {...commit()}
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
                    {...commit()}
                />,
            );
            const options = await screen.findAllByRole("option");
            expect(options.map((option) => option.textContent?.includes("(Default)"))).toEqual([
                false,
                false,
            ]);
        });
    });

    describe("commit mode", () => {
        it("commits the numeric draft and closes on Apply", () => {
            const onCommit = vi.fn();
            const onClose = vi.fn();
            render(
                <WrappedParameterControl
                    name="Threshold"
                    definition={numberDefinition}
                    value={25}
                    {...commit(onCommit, onClose)}
                />,
            );
            fireEvent.change(getInput(), { target: { value: "42" } });
            expect(onCommit).not.toHaveBeenCalled();
            fireEvent.click(getApply());
            expect(onCommit).toHaveBeenCalledWith(42);
            expect(onClose).toHaveBeenCalledTimes(1);
        });

        it("commits the text draft and closes on Apply", () => {
            const onCommit = vi.fn();
            const onClose = vi.fn();
            render(
                <WrappedParameterControl
                    name="Scenario"
                    definition={stringDefinition}
                    value="Actual"
                    {...commit(onCommit, onClose)}
                />,
            );
            fireEvent.change(getInput(), { target: { value: "Forecast" } });
            fireEvent.click(getApply());
            expect(onCommit).toHaveBeenCalledWith("Forecast");
            expect(onClose).toHaveBeenCalledTimes(1);
        });

        it("discards the draft on Cancel", () => {
            const onCommit = vi.fn();
            const onClose = vi.fn();
            render(
                <WrappedParameterControl
                    name="Scenario"
                    definition={stringDefinition}
                    value="Actual"
                    {...commit(onCommit, onClose)}
                />,
            );
            fireEvent.change(getInput(), { target: { value: "Forecast" } });
            fireEvent.click(screen.getByTestId("parameter-control-dropdown-cancel"));
            expect(onCommit).not.toHaveBeenCalled();
            expect(onClose).toHaveBeenCalledTimes(1);
        });

        it("disables Apply for a draft breaking the NUMBER constraints", () => {
            render(
                <WrappedParameterControl
                    name="Threshold"
                    definition={numberDefinition}
                    value={25}
                    {...commit()}
                />,
            );
            fireEvent.change(getInput(), { target: { value: "999" } });
            expect(getApply()).toBeDisabled();
        });

        it("commits the picked allowed value and closes", async () => {
            const onCommit = vi.fn();
            const onClose = vi.fn();
            render(
                <WrappedParameterControl
                    name="Scenario"
                    definition={enumDefinition}
                    value="Actual"
                    {...commit(onCommit, onClose)}
                />,
            );
            fireEvent.click(await screen.findByText("Plan"));
            expect(onCommit).toHaveBeenCalledWith("Plan");
            expect(onClose).toHaveBeenCalledTimes(1);
        });
    });

    describe("staged mode", () => {
        it("stages every valid numeric draft and offers Close instead of Cancel/Apply", () => {
            const onStage = vi.fn();
            render(
                <WrappedParameterControl
                    name="Threshold"
                    definition={numberDefinition}
                    value={25}
                    {...staged(onStage)}
                />,
            );
            fireEvent.change(getInput(), { target: { value: "42" } });
            expect(onStage).toHaveBeenCalledWith(42);
            expect(screen.queryByTestId("parameter-control-dropdown-apply")).not.toBeInTheDocument();
            expect(screen.queryByTestId("parameter-control-dropdown-cancel")).not.toBeInTheDocument();
            expect(getClose()).toBeInTheDocument();
        });

        it("shows the error and stages nothing for an invalid numeric draft", () => {
            const onStage = vi.fn();
            render(
                <WrappedParameterControl
                    name="Threshold"
                    definition={numberDefinition}
                    value={25}
                    {...staged(onStage)}
                />,
            );
            fireEvent.change(getInput(), { target: { value: "999" } });
            expect(screen.getByTestId("parameter-control-dropdown-error")).toBeInTheDocument();
            expect(onStage).not.toHaveBeenCalled();
        });

        it("keeps the last staged value when an invalid draft follows it", () => {
            const onStage = vi.fn();
            render(
                <WrappedParameterControl
                    name="Threshold"
                    definition={numberDefinition}
                    value={25}
                    {...staged(onStage)}
                />,
            );
            fireEvent.change(getInput(), { target: { value: "42" } });
            fireEvent.change(getInput(), { target: { value: "" } });
            expect(onStage.mock.calls).toEqual([[42]]);
        });

        it("stages the stepped value", () => {
            const onStage = vi.fn();
            render(
                <WrappedParameterControl
                    name="Threshold"
                    definition={numberDefinition}
                    value={25}
                    {...staged(onStage)}
                />,
            );
            fireEvent.click(getStepperUp());
            expect(onStage).toHaveBeenCalledWith(26);
        });

        it("stages resetValue as soon as Reset is clicked", () => {
            const onStage = vi.fn();
            render(
                <WrappedParameterControl
                    name="Threshold"
                    definition={numberDefinition}
                    value={50}
                    resetValue={25}
                    {...staged(onStage)}
                />,
            );
            fireEvent.click(getReset());
            expect(getInput()).toHaveValue(25);
            expect(onStage).toHaveBeenCalledWith(25);
        });

        it("stages every valid text draft and offers Close instead of Cancel/Apply", () => {
            const onStage = vi.fn();
            render(
                <WrappedParameterControl
                    name="Scenario"
                    definition={stringDefinition}
                    value="Actual"
                    {...staged(onStage)}
                />,
            );
            fireEvent.change(getInput(), { target: { value: "Forecast" } });
            expect(onStage).toHaveBeenCalledWith("Forecast");
            expect(screen.queryByTestId("parameter-control-dropdown-apply")).not.toBeInTheDocument();
        });

        it("stages nothing for a text draft breaking the length constraints", () => {
            const onStage = vi.fn();
            render(
                <WrappedParameterControl
                    name="Scenario"
                    definition={constrainedStringDefinition}
                    value="Actual"
                    {...staged(onStage)}
                />,
            );
            fireEvent.change(getInput(), { target: { value: "ab" } });
            expect(screen.getByTestId("parameter-control-dropdown-error")).toBeInTheDocument();
            expect(onStage).not.toHaveBeenCalled();
        });

        it("closes without reverting what was staged", () => {
            const onStage = vi.fn();
            const onClose = vi.fn();
            render(
                <WrappedParameterControl
                    name="Scenario"
                    definition={stringDefinition}
                    value="Actual"
                    {...staged(onStage, onClose)}
                />,
            );
            fireEvent.change(getInput(), { target: { value: "Forecast" } });
            fireEvent.click(getClose());
            expect(onClose).toHaveBeenCalledTimes(1);
            expect(onStage.mock.calls).toEqual([["Forecast"]]);
        });

        it("stages the picked allowed value and closes", async () => {
            const onStage = vi.fn();
            const onClose = vi.fn();
            render(
                <WrappedParameterControl
                    name="Scenario"
                    definition={enumDefinition}
                    value="Actual"
                    {...staged(onStage, onClose)}
                />,
            );
            fireEvent.click(await screen.findByText("Plan"));
            expect(onStage).toHaveBeenCalledWith("Plan");
            expect(onClose).toHaveBeenCalledTimes(1);
        });
    });
});
