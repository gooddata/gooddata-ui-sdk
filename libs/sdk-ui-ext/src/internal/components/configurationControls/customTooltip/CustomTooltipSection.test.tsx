// (C) 2026 GoodData Corporation

import { act, fireEvent, render, screen } from "@testing-library/react";
import { cloneDeep, set } from "lodash-es";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { InternalIntlWrapper } from "../../../utils/internalIntlProvider.js";

import { CustomTooltipSection, type ICustomTooltipSectionProps } from "./CustomTooltipSection.js";

/**
 * Debounce window of the content push (see CONTENT_DEBOUNCE_MS in CustomTooltipSection).
 */
const CONTENT_DEBOUNCE = 500;

/**
 * Window long enough for a pending content push to have fired.
 */
const IDLE_WINDOW = 600;

const defaultProps: ICustomTooltipSectionProps = {
    controlsDisabled: false,
    properties: {},
    propertiesMeta: {},
    pushData: () => {},
};

function createComponent(customProps: Partial<ICustomTooltipSectionProps> = {}) {
    const props: ICustomTooltipSectionProps = { ...cloneDeep(defaultProps), ...customProps };
    return render(
        <InternalIntlWrapper>
            <CustomTooltipSection {...props} />
        </InternalIntlWrapper>,
    );
}

const expanded = set({}, "custom_tooltip_section.collapsed", false);

/**
 * Moves the (fake) clock forward and lets React commit whatever settled meanwhile — the fired
 * debounce timer and the renders it triggers.
 *
 * Waiting for the debounce is therefore explicit and instant: no assertion has to poll for it and
 * no test spends real time on it.
 */
async function advance(ms: number) {
    await act(() => vi.advanceTimersByTimeAsync(ms));
}

/**
 * Waits out the content debounce so a pending push has landed.
 */
function settleDebounce() {
    return advance(CONTENT_DEBOUNCE);
}

/**
 * Types into the textarea one change event per keystroke, the way the component sees real typing.
 */
function type(textbox: HTMLElement, text: string) {
    for (let length = 1; length <= text.length; length++) {
        fireEvent.change(textbox, { target: { value: text.slice(0, length) } });
    }
}

describe("CustomTooltipSection", () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("renders the section title", () => {
        createComponent({ propertiesMeta: expanded });
        expect(screen.getByText("Custom tooltip")).toBeInTheDocument();
    });

    it("disables the toggle when controlsDisabled is true", () => {
        createComponent({ controlsDisabled: true, propertiesMeta: expanded });
        expect(screen.getByRole("checkbox")).toBeDisabled();
    });

    it("disables the textarea and dropdown when the section is toggled off", () => {
        createComponent({ propertiesMeta: expanded });
        expect(screen.getByRole("textbox")).toBeDisabled();
        expect(screen.getByRole("combobox")).toHaveClass("disabled");
    });

    it("enables the textarea and dropdown when the section is toggled on", () => {
        const enabled = set(cloneDeep(expanded), "controls.customTooltip.enabled", true);
        createComponent({
            properties: enabled,
            propertiesMeta: expanded,
        });
        expect(screen.getByRole("textbox")).toBeEnabled();
        expect(screen.getByRole("combobox")).not.toHaveClass("disabled");
    });

    it("disables the textarea when toggled on but controlsDisabled is true", () => {
        const enabled = set({}, "controls.customTooltip.enabled", true);
        createComponent({
            controlsDisabled: true,
            properties: enabled,
            propertiesMeta: expanded,
        });
        expect(screen.getByRole("textbox")).toBeDisabled();
    });

    it("calls pushData with updated content once the debounce settles", async () => {
        const pushDataSpy = vi.fn();
        const enabled = set({}, "controls.customTooltip.enabled", true);
        createComponent({
            properties: enabled,
            propertiesMeta: expanded,
            pushData: pushDataSpy,
        });

        type(screen.getByRole("textbox"), "x");

        await settleDebounce();

        expect(pushDataSpy).toHaveBeenCalledWith({
            properties: {
                controls: {
                    customTooltip: {
                        enabled: true,
                        content: "x",
                    },
                },
            },
        });
    });

    it("collapses rapid typing into a single trailing pushData call", async () => {
        const pushDataSpy = vi.fn();
        const enabled = set({}, "controls.customTooltip.enabled", true);
        createComponent({
            properties: enabled,
            propertiesMeta: expanded,
            pushData: pushDataSpy,
        });

        type(screen.getByRole("textbox"), "hello");

        expect(pushDataSpy).not.toHaveBeenCalled();

        await settleDebounce();

        expect(pushDataSpy).toHaveBeenCalledTimes(1);
        expect(pushDataSpy).toHaveBeenLastCalledWith({
            properties: {
                controls: {
                    customTooltip: {
                        enabled: true,
                        content: "hello",
                    },
                },
            },
        });
    });

    it("flushes pending content immediately on blur instead of waiting for the debounce", async () => {
        const pushDataSpy = vi.fn();
        const enabled = set({}, "controls.customTooltip.enabled", true);
        createComponent({
            properties: enabled,
            propertiesMeta: expanded,
            pushData: pushDataSpy,
        });

        const textbox = screen.getByRole("textbox");
        type(textbox, "fast");
        // Blur before the 500ms debounce would have settled.
        fireEvent.blur(textbox);

        expect(pushDataSpy).toHaveBeenCalledWith({
            properties: {
                controls: {
                    customTooltip: {
                        enabled: true,
                        content: "fast",
                    },
                },
            },
        });
    });

    it("syncs the textarea when content changes externally (e.g., undo or viz switch)", async () => {
        const pushDataSpy = vi.fn();
        const initial = set({}, "controls.customTooltip.enabled", true);
        set(initial, "controls.customTooltip.content", "original");

        const { rerender } = render(
            <InternalIntlWrapper>
                <CustomTooltipSection
                    controlsDisabled={false}
                    properties={initial}
                    propertiesMeta={expanded}
                    pushData={pushDataSpy}
                />
            </InternalIntlWrapper>,
        );

        expect(screen.getByRole("textbox")).toHaveValue("original");

        const updated = cloneDeep(initial);
        set(updated, "controls.customTooltip.content", "restored");
        rerender(
            <InternalIntlWrapper>
                <CustomTooltipSection
                    controlsDisabled={false}
                    properties={updated}
                    propertiesMeta={expanded}
                    pushData={pushDataSpy}
                />
            </InternalIntlWrapper>,
        );

        expect(screen.getByRole("textbox")).toHaveValue("restored");
    });

    it("cancels a pending push when content changes externally before the debounce settles", async () => {
        const pushDataSpy = vi.fn();
        const initial = set({}, "controls.customTooltip.enabled", true);

        const { rerender } = render(
            <InternalIntlWrapper>
                <CustomTooltipSection
                    controlsDisabled={false}
                    properties={initial}
                    propertiesMeta={expanded}
                    pushData={pushDataSpy}
                />
            </InternalIntlWrapper>,
        );

        type(screen.getByRole("textbox"), "stale");

        // External undo/load lands before our debounce fires.
        const undone = set(cloneDeep(initial), "controls.customTooltip.content", "undone");
        rerender(
            <InternalIntlWrapper>
                <CustomTooltipSection
                    controlsDisabled={false}
                    properties={undone}
                    propertiesMeta={expanded}
                    pushData={pushDataSpy}
                />
            </InternalIntlWrapper>,
        );

        expect(screen.getByRole("textbox")).toHaveValue("undone");

        // The pending "stale" push must not arrive after the external update.
        await advance(IDLE_WINDOW);
        expect(pushDataSpy).not.toHaveBeenCalled();
    });
});
