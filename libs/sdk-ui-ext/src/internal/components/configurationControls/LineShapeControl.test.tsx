// (C) 2026 GoodData Corporation

import { useState } from "react";

import { screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { render } from "../../../../test/render.js";

import { type ILineShapeControlProps, LineShapeControl } from "./LineShapeControl.js";

const requiredProps = {
    disabled: false,
    pushData: () => {},
} satisfies ILineShapeControlProps;

describe("LineShapeControl", () => {
    afterEach(() => {
        vi.useRealTimers();
    });

    it("should show a label and a button for each line shape that reveals its tooltip on hover", async () => {
        const { user } = render(<LineShapeControl {...requiredProps} />);

        expect(screen.getByText("Line shape")).toBeVisible();
        const group = screen.getByRole("group", { name: "Line shape" });
        expect(within(group).getByRole("button", { name: "Linear (default)" })).toBeVisible();
        expect(within(group).getByRole("button", { name: "Spline" })).toBeVisible();
        expect(within(group).getByRole("button", { name: "Stepped" })).toBeVisible();
        // NOTE: The tooltip is hidden from the accessibility tree and should serve only as a visual indicator for now (hence the `hidden: true`).
        // Button labels and tooltips have currently exactly the same text, so no need to announce the same text twice in screen readers.
        expect(screen.queryByRole("tooltip", { hidden: true })).not.toBeInTheDocument();

        await user.hover(screen.getByRole("button", { name: "Spline" }));

        expect(screen.queryByRole("tooltip")).not.toBeInTheDocument(); // Make sure the tooltip is in fact hidden from the accessibility tree
        expect(await screen.findByRole("tooltip", { hidden: true })).toBeVisible();
        expect(screen.getByRole("tooltip", { hidden: true })).toHaveTextContent("Spline");
    });

    it("should focus each button in correct order and reveal its tooltip when tabbing", async () => {
        const { user } = render(<LineShapeControl {...requiredProps} />);

        await user.tab();

        expect(screen.getByRole("button", { name: "Linear (default)" })).toHaveFocus();
        expect(screen.getByRole("tooltip", { hidden: true })).toHaveTextContent("Linear (default)");

        await user.tab();

        expect(screen.getByRole("button", { name: "Spline" })).toHaveFocus();
        expect(screen.getByRole("tooltip", { hidden: true })).toHaveTextContent("Spline");

        await user.tab();

        expect(screen.getByRole("button", { name: "Stepped" })).toHaveFocus();
        expect(screen.getByRole("tooltip", { hidden: true })).toHaveTextContent("Stepped");
    });

    it("should indicate pressed button state and save chosen line shape", async () => {
        const pushData = vi.fn();
        function Wrapper() {
            const [properties, setProperties] = useState<ILineShapeControlProps["properties"]>({
                controls: { dataPoints: { visible: true } },
            });
            return (
                <LineShapeControl
                    {...requiredProps}
                    properties={properties}
                    pushData={(data) => {
                        pushData(data);
                        setProperties(data.properties);
                    }}
                />
            );
        }
        const { user } = render(<Wrapper />);

        // Make sure "Linear" is pressed by default
        expect(screen.getByRole("button", { name: "Linear (default)", pressed: true })).toBeVisible();
        expect(screen.getByRole("button", { name: "Spline", pressed: false })).toBeVisible();
        expect(screen.getByRole("button", { name: "Stepped", pressed: false })).toBeVisible();

        await user.click(screen.getByRole("button", { name: "Stepped" }));
        await user.click(screen.getByRole("button", { name: "Stepped" }));

        expect(screen.getByRole("button", { pressed: true })).toHaveAccessibleName("Stepped");

        await user.click(screen.getByRole("button", { name: "Spline" }));

        expect(screen.getByRole("button", { pressed: true })).toHaveAccessibleName("Spline");

        await user.click(screen.getByRole("button", { name: "Linear (default)" }));

        expect(screen.getByRole("button", { pressed: true })).toHaveAccessibleName("Linear (default)");
        expect(pushData.mock.calls.flat()).toEqual([
            // Make sure other properties are also copied
            { properties: { controls: { dataPoints: { visible: true }, lineShape: "stepped" } } },
            { properties: { controls: { dataPoints: { visible: true }, lineShape: "spline" } } },
            { properties: { controls: { dataPoints: { visible: true }, lineShape: "linear" } } },
        ]);
    });

    it("should support disabled state and display a tooltip message to user", async () => {
        /**
         * Testing Library (userEvent) does not work with Vitest's fake timers as it hardcodes some Jest stuff.
         * Hence the `{ shouldAdvanceTime: true }` workaround. See https://github.com/testing-library/react-testing-library/issues/1197#issuecomment-1492580477
         * for more details.
         */
        vi.useFakeTimers({ shouldAdvanceTime: true });
        const pushData = vi.fn();
        const { user } = render(<LineShapeControl {...requiredProps} pushData={pushData} disabled />);

        screen.getAllByRole("button").forEach((button) => expect(button).toBeDisabled());

        await user.click(screen.getByRole("button", { name: "Spline" }));

        expect(pushData).not.toHaveBeenCalled();
        expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();

        await user.hover(screen.getByRole("button", { name: "Stepped" }));
        /**
         * This is needed because `<UiTooltip />` sets a delay before tooltip appears. Otherwise the `queryByRole()`
         * assertion would always pass. Both `act()` and `vi.advanceTimersByTimeAsync()` are needed for that.
         */
        await vi.advanceTimersByTimeAsync(1000);

        const tooltipText = "Property is not applicable for this configuration of the visualization";
        // Check that only one tooltip is visible. `hidden: true` includes both inaccessible and normal tooltips.
        expect(screen.getAllByRole("tooltip", { hidden: true })).toHaveLength(1);
        expect(screen.getByRole("tooltip", { name: tooltipText })).toBeVisible();
    });
});
