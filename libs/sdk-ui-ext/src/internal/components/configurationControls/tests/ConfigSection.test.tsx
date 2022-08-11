// (C) 2019-2022 GoodData Corporation
import React from "react";
import { waitFor } from "@testing-library/react";
import { DefaultLocale } from "@gooddata/sdk-ui";
import noop from "lodash/noop";
import { ConfigSection, IConfigSectionOwnProps } from "../ConfigSection";
import { createInternalIntl, InternalIntlWrapper } from "../../../utils/internalIntlProvider";
import { setupComponent } from "../../../tests/testHelper";

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
        return setupComponent(
            <InternalIntlWrapper>
                <ConfigSection {...props}>
                    <div>child</div>
                </ConfigSection>
            </InternalIntlWrapper>,
        );
    }

    describe("Rendering", () => {
        it("should render config section", () => {
            const { getByLabelText } = createComponent();
            expect(getByLabelText("Configuration section")).toBeInTheDocument();
        });

        it("should render children when not collapsed", () => {
            const { getByText } = createComponent({
                propertiesMeta: { id: { collapsed: false } },
            });
            expect(getByText("child")).toBeInTheDocument();
        });

        it("should not render children when collapsed", () => {
            const { queryByText } = createComponent();
            expect(queryByText("child")).not.toBeInTheDocument();
        });

        it('should update "collapsed" in state when clicked on header', async () => {
            const { getByText, queryByText, user } = createComponent();

            expect(queryByText("child")).not.toBeInTheDocument();
            await user.click(getByText("Legend"));
            expect(getByText("child")).toBeInTheDocument();
        });

        it("should call pushData when header clicked", async () => {
            const pushData = jest.fn();
            const { getByText, user } = createComponent({ pushData });

            await user.click(getByText("Legend"));
            await waitFor(() => {
                expect(pushData).toHaveBeenCalledTimes(1);
            });
        });
    });

    describe("Toggle switch", () => {
        it("should't render toggle switch by default", () => {
            const { queryByRole } = createComponent();
            expect(queryByRole("checkbox")).not.toBeInTheDocument();
        });

        it('should render toggle switch when property "canBeToggled" is set on true', () => {
            const { getByRole } = createComponent({ canBeToggled: true });
            expect(getByRole("checkbox")).toBeInTheDocument();
        });

        it("should call pushData when click on toggle switch with valuePath set", async () => {
            const pushData = jest.fn();
            const { getByRole, user } = createComponent({
                canBeToggled: true,
                valuePath: "path",
                properties: {},
                pushData,
            });

            await user.click(getByRole("checkbox"));
            await waitFor(() => {
                expect(pushData).toHaveBeenCalledTimes(1);
            });
        });

        it("shouldn't call pushData when click on toggle switch with undefined valuePath", async () => {
            const pushData = jest.fn();
            const { getByRole, user } = createComponent({
                canBeToggled: true,
                properties: {},
                pushData,
            });

            await user.click(getByRole("checkbox"));
            await waitFor(() => {
                expect(pushData).toHaveBeenCalledTimes(0);
            });
        });

        it("should disable toggle switch", () => {
            const { getByRole } = createComponent({
                canBeToggled: true,
                toggleDisabled: true,
            });

            expect(getByRole("checkbox")).toBeDisabled();
        });

        it("should check toggle switch by default", () => {
            const { getByRole } = createComponent({
                canBeToggled: true,
            });
            expect(getByRole("checkbox")).toBeChecked();
        });

        it('should uncheck toggle switch by property "toggledOn"', () => {
            const { getByRole } = createComponent({
                canBeToggled: true,
                toggledOn: false,
            });
            expect(getByRole("checkbox")).not.toBeChecked();
        });
    });
});
