// (C) 2019-2022 GoodData Corporation
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DefaultLocale } from "@gooddata/sdk-ui";
import noop from "lodash/noop";
import { ConfigSection, IConfigSectionOwnProps } from "../ConfigSection";
import { createInternalIntl, InternalIntlWrapper } from "../../../utils/internalIntlProvider";

describe("ConfigSection", () => {
    const defaultProps = {
        id: "id",
        properties: {},
        propertiesMeta: {},
        title: "properties.legend.title",
        intl: createInternalIntl(DefaultLocale),
        pushData: noop,
    };

    function createComponent(customProps: Partial<IConfigSectionOwnProps> = {}) {
        const props = { ...defaultProps, ...customProps };
        return render(
            <InternalIntlWrapper>
                <ConfigSection {...props}>
                    <div>child</div>
                </ConfigSection>
            </InternalIntlWrapper>,
        );
    }

    describe("Rendering", () => {
        it("should render config section", () => {
            createComponent();
            expect(screen.getByLabelText("Configuration section")).toBeInTheDocument();
        });

        it("should render children when not collapsed", () => {
            createComponent({
                propertiesMeta: { id: { collapsed: false } },
            });
            expect(screen.getByText("child")).toBeInTheDocument();
        });

        it("should not render children when collapsed", () => {
            createComponent();
            expect(screen.queryByText("child")).not.toBeInTheDocument();
        });

        it('should update "collapsed" in state when clicked on header', async () => {
            createComponent();

            expect(screen.queryByText("child")).not.toBeInTheDocument();
            await userEvent.click(screen.getByText("Legend"));
            expect(screen.getByText("child")).toBeInTheDocument();
        });

        it("should call pushData when header clicked", async () => {
            const pushData = jest.fn();
            createComponent({ pushData });

            await userEvent.click(screen.getByText("Legend"));
            await waitFor(() => {
                expect(pushData).toHaveBeenCalledTimes(1);
            });
        });
    });

    describe("Toggle switch", () => {
        it("should't render toggle switch by default", () => {
            createComponent();
            expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
        });

        it('should render toggle switch when property "canBeToggled" is set on true', () => {
            createComponent({ canBeToggled: true });
            expect(screen.getByRole("checkbox")).toBeInTheDocument();
        });

        it("should call pushData when click on toggle switch with valuePath set", async () => {
            const pushData = jest.fn();
            createComponent({
                canBeToggled: true,
                valuePath: "path",
                properties: {},
                pushData,
            });

            await userEvent.click(screen.getByRole("checkbox"));
            await waitFor(() => {
                expect(pushData).toHaveBeenCalledTimes(1);
            });
        });

        it("shouldn't call pushData when click on toggle switch with undefined valuePath", async () => {
            const pushData = jest.fn();
            createComponent({
                canBeToggled: true,
                properties: {},
                pushData,
            });

            await userEvent.click(screen.getByRole("checkbox"));
            await waitFor(() => {
                expect(pushData).toHaveBeenCalledTimes(0);
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
