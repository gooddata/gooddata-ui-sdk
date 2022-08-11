// (C) 2020-2022 GoodData Corporation
import React from "react";
import noop from "lodash/noop";
import PushpinViewportControl, { IPushpinViewportControl } from "../PushpinViewportControl";
import { InternalIntlWrapper } from "../../../utils/internalIntlProvider";
import { setupComponent } from "../../../tests/testHelper";

describe("PushpinViewportControl", () => {
    const defaultProps = {
        disabled: false,
        properties: {},
        pushData: noop,
    };

    function createComponent(customProps: Partial<IPushpinViewportControl> = {}) {
        const props = { ...defaultProps, ...customProps };
        return setupComponent(
            <InternalIntlWrapper>
                <PushpinViewportControl {...props} />
            </InternalIntlWrapper>,
        );
    }

    describe("Rendering", () => {
        it("should render PushpinViewportControl", () => {
            const { getByText } = createComponent();
            expect(getByText("Default viewport")).toBeInTheDocument();
        });

        it("should render disabled PushpinViewportControl", () => {
            const { getByRole } = createComponent({
                disabled: true,
            });
            expect(getByRole("button")).toHaveClass("disabled");
        });

        it("should have `Include all data` by default", () => {
            const { getByText } = createComponent();
            expect(getByText("Include all data")).toBeInTheDocument();
        });

        it.each([
            ["Include all data", "auto"],
            ["Africa", "continent_af"],
            ["Asia", "continent_as"],
            ["Australia", "continent_au"],
            ["Europe", "continent_eu"],
            ["America (North)", "continent_na"],
            ["America (South)", "continent_sa"],
            ["World", "world"],
        ])("should render %s as selected viewport item", (expectedText: string, area: string) => {
            const { getByText } = createComponent({
                properties: {
                    controls: {
                        viewport: {
                            area,
                        },
                    },
                },
            });
            expect(getByText(expectedText)).toBeInTheDocument();
        });
    });
});
