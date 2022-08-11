// (C) 2019-2022 GoodData Corporation
import React from "react";
import { waitFor } from "@testing-library/react";
import ConfigSubsection, { IConfigSubsectionOwnProps } from "../ConfigSubsection";
import { InternalIntlWrapper } from "../../../utils/internalIntlProvider";
import { setupComponent } from "../../../tests/testHelper";

describe("ConfigSubsection", () => {
    const defaultProps = {
        valuePath: "valuePath",
        properties: {},
        propertiesMeta: {},
        title: "properties.legend.title",
    };

    function createComponent(customProps: Partial<IConfigSubsectionOwnProps> = {}) {
        const props = { ...defaultProps, ...customProps };
        return setupComponent(
            <InternalIntlWrapper>
                <ConfigSubsection {...props}>
                    <div>child</div>
                </ConfigSubsection>
            </InternalIntlWrapper>,
        );
    }

    describe("Rendering", () => {
        it("should render config subsection", () => {
            const { getByLabelText } = createComponent();
            expect(getByLabelText("Configuration subsection")).toBeInTheDocument();
        });
    });

    describe("Toggle switch", () => {
        it("should't render toggle switch by default", () => {
            const { queryByRole } = createComponent();
            expect(queryByRole("checkbox")).not.toBeInTheDocument();
        });

        it('should render toggle switch when property "canBeToggled" is set on true', () => {
            const { getByRole } = createComponent({ canBeToggled: true });
            expect(getByRole("checkbox")).toBeEnabled();
        });

        it("should call pushData when click on toggle switch and", async () => {
            const pushData = jest.fn();
            const { getByRole, user } = createComponent({
                canBeToggled: true,
                properties: {},
                pushData,
            });

            await user.click(getByRole("checkbox"));
            await waitFor(() => {
                expect(pushData).toHaveBeenCalledTimes(1);
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
