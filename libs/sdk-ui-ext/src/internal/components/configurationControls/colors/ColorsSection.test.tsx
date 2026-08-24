// (C) 2019-2026 GoodData Corporation

import { act, fireEvent, render, screen } from "@testing-library/react";
import { cloneDeep } from "lodash-es";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { type IColor, type IMeasureDescriptor } from "@gooddata/sdk-model";
import { DefaultColorPalette } from "@gooddata/sdk-ui";

import { type IColorConfiguration } from "../../../interfaces/Colors.js";
import { InternalIntlWrapper } from "../../../utils/internalIntlProvider.js";

import { COLOR_MAPPING_CHANGED, ColorsSection, type IColorsSectionProps } from "./ColorsSection.js";

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
    references: undefined,
    pushData: () => {},
    hasMeasures: true,
    colors,
    isLoading: false,
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

/**
 * ColorDropdown intentionally defers its onReset/onColorSelected callbacks by a 100ms setTimeout so
 * that closing the dropdown is not interrupted. Fake timers make that wait explicit and instant
 * instead of letting the test sit through it in real time.
 *
 * Note the components under test only listen for plain `onClick`, so `fireEvent.click` is enough.
 * userEvent is deliberately avoided here: its awaits go through testing-library's asyncWrapper,
 * which under Vitest fake timers waits on a faked `setTimeout` that never fires.
 */
const COLOR_DROPDOWN_CALLBACK_DELAY = 100;

/**
 * Moves the (fake) clock forward and lets React commit everything that settled meanwhile.
 */
async function advance(ms: number) {
    await act(() => vi.advanceTimersByTimeAsync(ms));
}

describe("ColorsSection", () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("should render ColorSection control with 2 colors", () => {
        const { container } = createComponent();

        expect(screen.getByText("Colors")).toBeInTheDocument();
        expect(container.querySelectorAll(".s-colored-items-list-item")).toHaveLength(2);
    });
    it("should render ColorSection with fills", () => {
        createComponent({
            supportsChartFill: true,
        });

        expect(screen.getByText("Colors and fills")).toBeInTheDocument();
    });

    it("should NOT render ColoredItemsList when no measure, unsupported color message is visible", () => {
        const { container } = createComponent({
            hasMeasures: false,
        });

        expect(container.querySelector(".s-colored-items-list-item")).not.toBeInTheDocument();
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

        // the Reset Colors button pushes the data synchronously, no waiting needed
        fireEvent.click(screen.getByText("Reset Colors"));

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

    it("should offer Reset in the color dropdown only for a custom-mapped derived measure", async () => {
        const pushData = vi.fn();
        const color1: IColor = {
            type: "guid",
            value: "guid1",
        };
        const measureColors: IColorConfiguration = {
            colorPalette: DefaultColorPalette,
            colorAssignments: [
                {
                    headerItem: {
                        measureHeaderItem: { localIdentifier: "m1_pop", name: "Amount - period ago" },
                    } as IMeasureDescriptor,
                    color: { type: "guid", value: "4" },
                },
                {
                    headerItem: {
                        measureHeaderItem: { localIdentifier: "m1", name: "Amount" },
                    } as IMeasureDescriptor,
                    color: { type: "guid", value: "5" },
                },
            ],
        };
        const properties = {
            controls: {
                colorMapping: [
                    { id: "m1_pop", color: color1 },
                    { id: "m1", color: color1 },
                ],
                test: 1,
            },
        };
        const { container } = createComponent({
            pushData,
            properties,
            colors: measureColors,
            derivedMeasureLocalIds: ["m1_pop"],
        });

        // master measure item offers no Reset even though it is custom mapped
        fireEvent.click(container.querySelectorAll(".s-colored-items-list-item")[1]!);
        expect(screen.queryByText("Reset")).not.toBeInTheDocument();

        fireEvent.click(container.querySelectorAll(".s-colored-items-list-item")[0]!);
        fireEvent.click(screen.getByText("Reset"));
        await advance(COLOR_DROPDOWN_CALLBACK_DELAY);

        expect(pushData).toBeCalledWith(
            expect.objectContaining({
                messageId: COLOR_MAPPING_CHANGED,
                properties: {
                    controls: {
                        colorMapping: [
                            { id: "m1_pop", color: null },
                            { id: "m1", color: color1 },
                        ],
                        test: 1,
                    },
                },
            }),
        );
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
