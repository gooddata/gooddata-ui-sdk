// (C) 2007-2026 GoodData Corporation

import { fireEvent, render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { withIntlForTest } from "@gooddata/sdk-ui";

import {
    type IUiColorPickerCommitProps,
    type IUiColorPickerProps,
    type IUiColorPickerRgb,
    type IUiColorPickerRgba,
} from "./types.js";
import { UiColorPicker } from "./UiColorPicker.js";

const RED: IUiColorPickerRgb = { r: 255, g: 0, b: 0 };

const MESSAGES = {
    "gs.ui-color-picker.wheel": "hue",
    "gs.ui-color-picker.lightness": "lightness",
    "gs.ui-color-picker.opacity": "opacity",
    "gs.ui-color-picker.value": "value",
    "gs.ui-color-picker.notation": "notation",
    "gs.ui-color-picker.cancelButton": "cancel",
    "gs.ui-color-picker.okButton": "ok",
};

const noop = () => undefined;

// Built once: a wrapper made per render would be a different component type, and re-rendering would
// mount a fresh picker instead of handing the standing one new props.
const Picker = withIntlForTest(UiColorPicker, "en-US", MESSAGES);

function renderPicker(props: IUiColorPickerProps) {
    return render(<Picker {...props} />);
}

function renderGathering(props?: Partial<Pick<IUiColorPickerCommitProps, "onSubmit" | "onCancel">>) {
    return renderPicker({ initialRgbColor: RED, onSubmit: noop, onCancel: noop, ...props });
}

function renderLive(onChange: (color: IUiColorPickerRgba) => void, supportsAlpha?: boolean) {
    return renderPicker({ initialRgbColor: RED, supportsAlpha, onChange });
}

// The controls read a gesture against their own size, which a test environment reports as zero.
function sizeAsSquare(element: HTMLElement, size: number) {
    vi.spyOn(element, "getBoundingClientRect").mockReturnValue({
        x: 0,
        y: 0,
        left: 0,
        top: 0,
        right: size,
        bottom: size,
        width: size,
        height: size,
        toJSON: () => ({}),
    });
}

describe("UiColorPicker", () => {
    it("opens at the color it was given", () => {
        renderGathering();

        expect(screen.getByRole("textbox")).toHaveValue("#ff0000");
        expect(screen.getByRole("slider", { name: "hue" })).toHaveAttribute("aria-valuenow", "0");
        expect(screen.getByRole("button", { name: "ok" })).toBeDisabled();
    });

    it("opens at the opacity it was given", () => {
        renderPicker({
            initialRgbColor: { ...RED, a: 0.5 },
            supportsAlpha: true,
            onSubmit: noop,
            onCancel: noop,
        });

        expect(screen.getByRole("textbox")).toHaveValue("#ff000080");
        expect(screen.getByRole("slider", { name: "opacity" })).toHaveAttribute("aria-valuenow", "50");
    });

    it("offers an opacity control only where the color may carry one", () => {
        renderGathering();
        expect(screen.queryByRole("slider", { name: "opacity" })).not.toBeInTheDocument();

        renderPicker({ initialRgbColor: RED, supportsAlpha: true, onSubmit: noop, onCancel: noop });
        expect(screen.getByRole("slider", { name: "opacity" })).toBeInTheDocument();
    });

    describe("the wheel", () => {
        it("keeps picking for as long as the button is held", () => {
            const onChange = vi.fn<(color: IUiColorPickerRgba) => void>();
            renderLive(onChange);
            const wheel = screen.getByRole("slider", { name: "hue" });
            sizeAsSquare(wheel, 100);

            fireEvent.pointerDown(wheel, { clientX: 100, clientY: 50, button: 0 });
            fireEvent.pointerMove(wheel, { clientX: 50, clientY: 100, buttons: 1 });
            fireEvent.pointerMove(wheel, { clientX: 0, clientY: 50, buttons: 1 });

            expect(onChange.mock.calls.map(([color]) => color)).toEqual([
                { r: 255, g: 0, b: 0, a: 1 },
                { r: 128, g: 255, b: 0, a: 1 },
                { r: 0, g: 255, b: 255, a: 1 },
            ]);
        });

        it("stops picking once the button is released", () => {
            const onChange = vi.fn<(color: IUiColorPickerRgba) => void>();
            renderLive(onChange);
            const wheel = screen.getByRole("slider", { name: "hue" });
            sizeAsSquare(wheel, 100);

            fireEvent.pointerDown(wheel, { clientX: 100, clientY: 50, button: 0 });
            fireEvent.pointerUp(wheel, { clientX: 100, clientY: 50 });
            fireEvent.pointerMove(wheel, { clientX: 0, clientY: 50, buttons: 1 });

            expect(onChange).toHaveBeenCalledTimes(1);
        });

        it("stops picking when a move arrives with nothing held", () => {
            const onChange = vi.fn<(color: IUiColorPickerRgba) => void>();
            renderLive(onChange);
            const wheel = screen.getByRole("slider", { name: "hue" });
            sizeAsSquare(wheel, 100);

            fireEvent.pointerDown(wheel, { clientX: 100, clientY: 50, button: 0 });
            // The press ended somewhere the wheel was not told about, so what follows is a hover.
            fireEvent.pointerMove(wheel, { clientX: 50, clientY: 100, buttons: 0 });
            fireEvent.pointerMove(wheel, { clientX: 0, clientY: 50, buttons: 1 });

            expect(onChange).toHaveBeenCalledTimes(1);
        });

        it("keeps the hue when the middle is pressed, which points nowhere", () => {
            const onChange = vi.fn<(color: IUiColorPickerRgba) => void>();
            renderPicker({ initialRgbColor: { r: 0, g: 128, b: 0 }, onChange });
            const wheel = screen.getByRole("slider", { name: "hue" });
            sizeAsSquare(wheel, 100);

            fireEvent.pointerDown(wheel, { clientX: 50, clientY: 50, button: 0 });

            expect(wheel).toHaveAttribute("aria-valuenow", "120");
        });

        it("ignores a press that is not the primary button", () => {
            const onChange = vi.fn<(color: IUiColorPickerRgba) => void>();
            renderLive(onChange);
            const wheel = screen.getByRole("slider", { name: "hue" });
            sizeAsSquare(wheel, 100);

            fireEvent.pointerDown(wheel, { clientX: 100, clientY: 50, button: 2 });

            expect(onChange).not.toHaveBeenCalled();
        });

        it("turns by the arrow keys", () => {
            renderGathering();
            const wheel = screen.getByRole("slider", { name: "hue" });

            fireEvent.keyDown(wheel, { key: "ArrowRight" });

            expect(wheel).toHaveAttribute("aria-valuenow", "2");
            expect(screen.getByRole("textbox")).toHaveValue("#ff0900");
        });
    });

    it("drags a slider the same way", () => {
        const onChange = vi.fn<(color: IUiColorPickerRgba) => void>();
        renderLive(onChange);
        const lightness = screen.getByRole("slider", { name: "lightness" });
        sizeAsSquare(lightness, 100);

        fireEvent.pointerDown(lightness, { clientX: 0, clientY: 50, button: 0 });
        fireEvent.pointerMove(lightness, { clientX: 100, clientY: 50, buttons: 1 });

        expect(onChange.mock.calls.map(([color]) => color)).toEqual([
            { r: 0, g: 0, b: 0, a: 1 },
            { r: 255, g: 255, b: 255, a: 1 },
        ]);
    });

    it("reports every change as it is made, with nothing left to confirm", () => {
        const onChange = vi.fn<(color: IUiColorPickerRgba) => void>();
        renderLive(onChange);

        fireEvent.keyDown(screen.getByRole("slider", { name: "lightness" }), { key: "Home" });

        expect(onChange).toHaveBeenCalledWith({ r: 0, g: 0, b: 0, a: 1 });
        expect(screen.queryByRole("button", { name: "ok" })).not.toBeInTheDocument();
    });

    // Live, the color is already applied, so there is nothing here to confirm or take back.
    it("puts up no buttons when every change is already reported", () => {
        renderLive(noop);

        expect(screen.queryByRole("button", { name: "cancel" })).not.toBeInTheDocument();
        expect(screen.queryByRole("button", { name: "ok" })).not.toBeInTheDocument();
    });

    describe("a color set from outside", () => {
        it("moves the controls to it", () => {
            const { rerender } = renderGathering();
            expect(screen.getByRole("slider", { name: "hue" })).toHaveAttribute("aria-valuenow", "0");

            rerender(<Picker initialRgbColor={{ r: 0, g: 128, b: 0 }} onSubmit={noop} onCancel={noop} />);

            expect(screen.getByRole("slider", { name: "hue" })).toHaveAttribute("aria-valuenow", "120");
            expect(screen.getByRole("textbox")).toHaveValue("#008000");
        });

        it("leaves a color it renders the same alone, keeping the hue a gray cannot carry", () => {
            const gray = { r: 128, g: 128, b: 128 };
            const { rerender } = renderPicker({
                initialRgbColor: gray,
                onSubmit: noop,
                onCancel: noop,
            });

            fireEvent.keyDown(screen.getByRole("slider", { name: "hue" }), { key: "ArrowRight" });
            fireEvent.keyDown(screen.getByRole("slider", { name: "hue" }), { key: "ArrowRight" });
            expect(screen.getByRole("slider", { name: "hue" })).toHaveAttribute("aria-valuenow", "4");

            rerender(<Picker initialRgbColor={{ ...gray }} onSubmit={noop} onCancel={noop} />);

            expect(screen.getByRole("slider", { name: "hue" })).toHaveAttribute("aria-valuenow", "4");
        });
    });

    it("reports a gathered color once, when it is confirmed", () => {
        const onSubmit = vi.fn<(color: IUiColorPickerRgba) => void>();
        const onCancel = vi.fn();
        renderGathering({ onSubmit, onCancel });

        fireEvent.keyDown(screen.getByRole("slider", { name: "lightness" }), { key: "End" });
        expect(onSubmit).not.toHaveBeenCalled();

        fireEvent.click(screen.getByRole("button", { name: "ok" }));
        fireEvent.click(screen.getByRole("button", { name: "cancel" }));

        expect(onSubmit).toHaveBeenCalledTimes(1);
        expect(onSubmit).toHaveBeenCalledWith({ r: 255, g: 255, b: 255, a: 1 });
        expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it("carries no opacity where there is no control for one", () => {
        const onChange = vi.fn<(color: IUiColorPickerRgba) => void>();
        renderPicker({ initialRgbColor: { ...RED, a: 0.5 }, onChange });

        expect(screen.getByRole("textbox")).toHaveValue("#ff0000");

        fireEvent.change(screen.getByRole("textbox"), { target: { value: "rgba(0, 0, 255, 0.25)" } });

        expect(onChange).toHaveBeenCalledWith({ r: 0, g: 0, b: 255, a: 1 });
    });

    describe("the value field", () => {
        it("takes a color typed in any notation", () => {
            const onChange = vi.fn<(color: IUiColorPickerRgba) => void>();
            renderLive(onChange);

            fireEvent.change(screen.getByRole("textbox"), { target: { value: "hsl(120, 100%, 25%)" } });

            expect(onChange).toHaveBeenCalledWith({ r: 0, g: 128, b: 0, a: 1 });
            expect(screen.getByRole("slider", { name: "hue" })).toHaveAttribute("aria-valuenow", "120");
        });

        it("writes the color in the notation picked for it", async () => {
            renderGathering();

            await userEvent.click(screen.getByRole("combobox", { name: "notation" }));
            // The listbox marks the whole row as the option but takes the click on the label inside.
            await userEvent.click(screen.getByText("HSL"));

            expect(screen.getByRole("textbox")).toHaveValue("hsl(0, 100%, 50%)");
            expect(screen.getByRole("combobox", { name: "notation" })).toHaveTextContent("HSL");
        });

        it("applies nothing while a function notation is still open", () => {
            const onChange = vi.fn<(color: IUiColorPickerRgba) => void>();
            renderLive(onChange);
            const field = screen.getByRole("textbox");

            // A parser reads this as white, which would flash the document mid-word.
            fireEvent.change(field, { target: { value: "hsl(210, 53%, 1" } });

            expect(onChange).not.toHaveBeenCalled();

            fireEvent.change(field, { target: { value: "hsl(210, 53%, 15%)" } });

            expect(onChange).toHaveBeenCalledTimes(1);
            expect(onChange).toHaveBeenCalledWith({ r: 18, g: 38, b: 59, a: 1 });
        });

        it("applies nothing until a hex written without its hash is whole", () => {
            const onChange = vi.fn<(color: IUiColorPickerRgba) => void>();
            renderLive(onChange);
            const field = screen.getByRole("textbox");

            for (const typed of ["1", "12", "122", "1226", "12263"]) {
                fireEvent.change(field, { target: { value: typed } });
            }

            expect(onChange).not.toHaveBeenCalled();

            fireEvent.change(field, { target: { value: "12263a" } });

            expect(onChange).toHaveBeenCalledTimes(1);
            expect(onChange).toHaveBeenCalledWith({ r: 18, g: 38, b: 58, a: 1 });
        });

        it("applies a named color only once the typing stops", () => {
            const onChange = vi.fn<(color: IUiColorPickerRgba) => void>();
            renderLive(onChange);
            const field = screen.getByRole("textbox");

            for (const typed of ["b", "bl", "blu", "blue", "bluev", "blueviole"]) {
                fireEvent.change(field, { target: { value: typed } });
            }
            fireEvent.change(field, { target: { value: "blueviolet" } });

            expect(onChange).not.toHaveBeenCalled();

            fireEvent.blur(field);

            expect(onChange).toHaveBeenCalledTimes(1);
            expect(onChange).toHaveBeenCalledWith({ r: 138, g: 43, b: 226, a: 1 });
        });

        it("marks text that is not a color without discarding it", () => {
            renderGathering();
            const field = screen.getByRole("textbox");

            fireEvent.change(field, { target: { value: "#f0" } });

            expect(field).toHaveValue("#f0");
            expect(field).toHaveAttribute("aria-invalid", "true");
        });
    });
});
