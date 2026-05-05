// (C) 2026 GoodData Corporation

import { render, screen } from "@testing-library/react";
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

    it("calls pushData with updated content on textarea change", async () => {
        const pushDataSpy = vi.fn();
        const enabled = set({}, "controls.customTooltip.enabled", true);
        createComponent({
            properties: enabled,
            propertiesMeta: expanded,
            pushData: pushDataSpy,
        });

        await userEvent.type(screen.getByRole("textbox"), "x");

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
