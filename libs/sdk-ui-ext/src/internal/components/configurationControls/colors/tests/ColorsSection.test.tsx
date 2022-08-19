// (C) 2019-2022 GoodData Corporation
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { IColor } from "@gooddata/sdk-model";
import { DefaultColorPalette } from "@gooddata/sdk-ui";
import { IColorConfiguration } from "../../../../interfaces/Colors";
import { InternalIntlWrapper } from "../../../../utils/internalIntlProvider";

import ColorsSection, { COLOR_MAPPING_CHANGED, IColorsSectionProps } from "../ColorsSection";
import cloneDeep from "lodash/cloneDeep";
import noop from "lodash/noop";

const colors: IColorConfiguration = {
    colorPalette: DefaultColorPalette,
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
    return render(
        <InternalIntlWrapper>
            <ColorsSection {...props} />
        </InternalIntlWrapper>,
    );
}

describe("ColorsSection", () => {
    it("should render ColorSection control with 2 colors", () => {
        createComponent();

        expect(screen.getByText("Colors")).toBeInTheDocument();
        expect(screen.getAllByRole("row")).toHaveLength(3); // including header row
    });

    it("should NOT render ColoredItemsList when no measure, unsupported color message is visible", () => {
        createComponent({
            hasMeasures: false,
        });

        expect(screen.queryByRole("row")).not.toBeInTheDocument();
    });

    it("should render error message when no measure", () => {
        createComponent({
            hasMeasures: false,
        });

        expect(
            screen.getByText(/There are no colors for this configuration of the insight/i),
        ).toBeInTheDocument();
    });

    it("should render Reset Colors button", () => {
        createComponent();
        expect(screen.getByText("Reset Colors")).toBeInTheDocument();
    });

    it("should call pushData on Reset Colors button click", async () => {
        const pushData = jest.fn();
        const color1: IColor = {
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
        createComponent({
            pushData,
            properties,
            references,
        });

        await userEvent.click(screen.getByText("Reset Colors"));
        await waitFor(() => {
            expect(pushData).toBeCalledWith(
                expect.objectContaining({
                    messageId: COLOR_MAPPING_CHANGED,
                    properties: {
                        controls: {
                            colorMapping: undefined,
                            test: 1,
                        },
                    },
                    references: {},
                }),
            );
        });
    });

    it("should contain loading element when in loading state", () => {
        createComponent({
            isLoading: true,
        });
        expect(screen.getByLabelText("loading")).toBeInTheDocument();
    });
});
