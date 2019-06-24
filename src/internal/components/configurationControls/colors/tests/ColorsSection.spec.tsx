// (C) 2019 GoodData Corporation
import * as React from "react";
import { mount } from "enzyme";
import { noop, cloneDeep } from "lodash";
import * as ChartConfiguration from "../../../../../interfaces/Config";
import { IColorItem } from "@gooddata/gooddata-js";

import ColoredItemsList from "../coloredItemsList/ColoredItemsList";
import ColorsSection, { IColorsSectionProps, COLOR_MAPPING_CHANGED } from "../ColorsSection";
import { IColorConfiguration } from "../../../../interfaces/Colors";
import { InternalIntlWrapper } from "../../../../utils/internalIntlProvider";

const colors: IColorConfiguration = {
    colorPalette: ChartConfiguration.DEFAULT_COLOR_PALETTE,
    colorAssignments: [
        {
            headerItem: { attributeHeaderItem: { uri: "/ahi1", name: "abc" } },
            color: {
                type: "guid",
                value: "4",
            },
        },
        {
            headerItem: { attributeHeaderItem: { uri: "/ahi2", name: "def" } },
            color: {
                type: "guid",
                value: "5",
            },
        },
    ],
};

const defaultProps: IColorsSectionProps = {
    controlsDisabled: false,
    showCustomPicker: false,
    properties: {},
    propertiesMeta: {
        colors_section: {
            collapsed: false,
        },
    },
    references: null,
    pushData: noop,
    hasMeasures: true,
    colors,
    isLoading: false,
};

function createComponent(customProps: Partial<IColorsSectionProps> = {}) {
    const props: IColorsSectionProps = { ...cloneDeep(defaultProps), ...customProps };
    return mount<IColorsSectionProps>(
        <InternalIntlWrapper>
            <ColorsSection {...props} />
        </InternalIntlWrapper>,
    );
}

describe("ColorsSection", () => {
    it("should render ColoredItemsList control in normal state", () => {
        const wrapper = createComponent();
        expect(wrapper.find(ColoredItemsList).length).toBe(1);
    });

    it("should NOT render ColoredItemsList control when no measure", () => {
        const wrapper = createComponent({
            hasMeasures: false,
        });
        expect(wrapper.find(ColoredItemsList).length).toBe(0);
        expect(wrapper.find(".gd-color-unsupported").length).toBe(1);
    });

    it("should render Reset Colors button", () => {
        const wrapper = createComponent();
        expect(wrapper.find("Button.s-reset-colors-button").length).toBe(1);
    });

    it("should call pushData on Reset Colors button click", () => {
        const pushData = jest.fn();
        const color1: IColorItem = {
            type: "guid",
            value: "guid1",
        };
        const properties = {
            controls: {
                colorMapping: [
                    {
                        id: "aaa",
                        color: color1,
                    },
                ],
                test: 1,
            },
        };
        const references = { aaa: "/a1" };
        const wrapper = createComponent({
            pushData,
            properties,
            references,
        });
        wrapper.find("Button.s-reset-colors-button").simulate("click");
        expect(pushData).toHaveBeenCalledWith({
            messageId: COLOR_MAPPING_CHANGED,
            properties: {
                controls: {
                    colorMapping: undefined,
                    test: 1,
                },
            },
            references: {},
        });
    });

    it("should contain loading element when in loading state", () => {
        const wrapper = createComponent({
            isLoading: true,
        });
        expect(wrapper.find(ColoredItemsList).length).toBe(1);
        expect(wrapper.find(".s-isLoading").length).toBe(1);
    });
});
