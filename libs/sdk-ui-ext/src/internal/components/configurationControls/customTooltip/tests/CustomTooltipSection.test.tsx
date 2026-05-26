// (C) 2026 GoodData Corporation

import { render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { cloneDeep, set } from "lodash-es";
import { describe, expect, it, vi } from "vitest";

import { InternalIntlWrapper } from "../../../../utils/internalIntlProvider.js";
import { CustomTooltipSection, type ICustomTooltipSectionProps } from "../CustomTooltipSection.js";

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

describe("CustomTooltipSection", () => {
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

        await userEvent.type(screen.getByRole("textbox"), "x");

        await waitFor(() => {
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
    });

    it("collapses rapid typing into a single trailing pushData call", async () => {
        const pushDataSpy = vi.fn();
        const enabled = set({}, "controls.customTooltip.enabled", true);
        createComponent({
            properties: enabled,
            propertiesMeta: expanded,
            pushData: pushDataSpy,
        });

        await userEvent.type(screen.getByRole("textbox"), "hello");

        await waitFor(() => {
            expect(pushDataSpy).toHaveBeenCalledTimes(1);
        });
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

        await userEvent.type(screen.getByRole("textbox"), "stale");

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
        await new Promise((resolve) => setTimeout(resolve, 600));
        expect(pushDataSpy).not.toHaveBeenCalled();
    });
});
