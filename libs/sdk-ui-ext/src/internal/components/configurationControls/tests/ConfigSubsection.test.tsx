// (C) 2019-2025 GoodData Corporation

import { render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { InternalIntlWrapper } from "../../../utils/internalIntlProvider.js";
import { ConfigSubsection, type IConfigSubsectionOwnProps } from "../ConfigSubsection.js";

describe("ConfigSubsection", () => {
    const defaultProps = {
        valuePath: "valuePath",
        properties: {},
        propertiesMeta: {},
        title: "properties.legend.title",
    };

    function createComponent(customProps: Partial<IConfigSubsectionOwnProps> = {}) {
        const props = { ...defaultProps, ...customProps };
        return render(
            <InternalIntlWrapper>
                <ConfigSubsection {...props}>
                    <div>child</div>
                </ConfigSubsection>
            </InternalIntlWrapper>,
        );
    }

    describe("Rendering", () => {
        it("should render config subsection", () => {
            createComponent();
            expect(screen.getByLabelText("Configuration subsection")).toBeInTheDocument();
        });
    });

    describe("Toggle switch", () => {
        it("should't render toggle switch by default", () => {
            createComponent();
            expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
        });

        it('should render toggle switch when property "canBeToggled" is set on true', () => {
            createComponent({ canBeToggled: true });
            expect(screen.getByRole("checkbox")).toBeEnabled();
        });

        it("should call pushData when click on toggle switch and", async () => {
            const pushData = vi.fn();
            createComponent({
                canBeToggled: true,
                properties: {},
                pushData,
            });

            await userEvent.click(screen.getByRole("checkbox"));
            await waitFor(() => {
                expect(pushData).toHaveBeenCalledTimes(1);
            });
        });

        it("should disable toggle switch", () => {
            createComponent({
                canBeToggled: true,
                toggleDisabled: true,
            });

            expect(screen.getByRole("checkbox")).toBeDisabled();
        });

        it("should check toggle switch by default", () => {
            createComponent({
                canBeToggled: true,
            });
            expect(screen.getByRole("checkbox")).toBeChecked();
        });

        it('should uncheck toggle switch by property "toggledOn"', () => {
            createComponent({
                canBeToggled: true,
                toggledOn: false,
            });
            expect(screen.getByRole("checkbox")).not.toBeChecked();
        });
    });
});
