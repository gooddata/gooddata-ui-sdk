// (C) 2019-2025 GoodData Corporation

import { render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { cloneDeep } from "lodash-es";
import { describe, expect, it, vi } from "vitest";

import { IColor } from "@gooddata/sdk-model";
import { DefaultColorPalette } from "@gooddata/sdk-ui";

import { IColorConfiguration } from "../../../../interfaces/Colors.js";
import { InternalIntlWrapper } from "../../../../utils/internalIntlProvider.js";
import ColorsSection, { COLOR_MAPPING_CHANGED, IColorsSectionProps } from "../ColorsSection.js";

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
    properties: {},
    propertiesMeta: {
        colors_section: {
            collapsed: false,
        },
    },
    references: null,
    pushData: () => {},
    hasMeasures: true,
    colors,
    isLoading: false,
    isChartAccessibilityFeaturesEnabled: false,
    supportsChartFill: false,
};

const propsWithFalsyColor = (value: any): IColorsSectionProps => ({
    ...defaultProps,
    colors: {
        colorPalette: DefaultColorPalette,
        colorAssignments: [
            ...colors.colorAssignments,
            {
                headerItem: { attributeHeaderItem: { uri: value, name: value } },
                color: {
                    type: "guid",
                    value: "6",
                },
            },
        ],
    },
});

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
    it("should render ColorSection with fills", () => {
        createComponent({
            supportsChartFill: true,
            isChartAccessibilityFeaturesEnabled: true,
        });

        expect(screen.getByText("Colors and fills")).toBeInTheDocument();
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
            screen.getByText(/There are no colors for this configuration of the visualization/i),
        ).toBeInTheDocument();
    });

    it("should render Reset Colors button", () => {
        createComponent();
        expect(screen.getByText("Reset Colors")).toBeInTheDocument();
    });

    it("should call pushData on Reset Colors button click", async () => {
        const pushData = vi.fn();
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

    it("should render ColoredItem for null text value", () => {
        createComponent(propsWithFalsyColor(null));

        expect(screen.getByText("(empty value)")).toBeInTheDocument();
    });

    it("should render ColoredItem for empty string text value", () => {
        createComponent(propsWithFalsyColor(""));

        expect(screen.getByText("(empty value)")).toBeInTheDocument();
    });
});
