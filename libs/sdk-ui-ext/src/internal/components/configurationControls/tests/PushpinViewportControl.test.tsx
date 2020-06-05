// (C) 2020 GoodData Corporation
import * as React from "react";
import { mount } from "enzyme";
import noop = require("lodash/noop");
import PushpinViewportControl, { IPushpinViewportControl } from "../PushpinViewportControl";
import { InternalIntlWrapper } from "../../../utils/internalIntlProvider";

describe("PushpinViewportControl", () => {
    const defaultProps = {
        disabled: false,
        properties: {},
        pushData: noop,
    };

    function createComponent(customProps: Partial<IPushpinViewportControl> = {}) {
        const props = { ...defaultProps, ...customProps };
        return mount(
            <InternalIntlWrapper>
                <PushpinViewportControl {...props} />
            </InternalIntlWrapper>,
        );
    }

    describe("Rendering", () => {
        const buttonSelector = ".s-pushpin-viewport-control .dropdown-button";
        const buttonTextSelector = ".s-pushpin-viewport-control .dropdown-button .gd-button-text";

        it("should render PushpinViewportControl", () => {
            const wrapper = createComponent();

            expect(wrapper.find(PushpinViewportControl).length).toBe(1);
        });

        it("should render disabled PushpinViewportControl", () => {
            const wrapper = createComponent({
                disabled: true,
            });

            expect(wrapper.find(`${buttonSelector}.disabled`).length).toBe(1);
        });

        it("should have `Include all data` by default", () => {
            const wrapper = createComponent();

            expect(wrapper.find(buttonTextSelector).text()).toEqual("Include all data");
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
            const wrapper = createComponent({
                properties: {
                    controls: {
                        viewport: {
                            area,
                        },
                    },
                },
            });

            expect(wrapper.find(buttonTextSelector).text()).toEqual(expectedText);
        });
    });
});
