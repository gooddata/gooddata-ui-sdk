// (C) 2019-2025 GoodData Corporation

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { type IDataLabelsVisible } from "@gooddata/sdk-ui-charts";

import { InternalIntlWrapper } from "../../../utils/internalIntlProvider.js";
import { DataLabelsControl, type IDataLabelsControlProps } from "../DataLabelsControl.js";

describe("DataLabelsControl", () => {
    const HIDE_LABEL = "hide";
    const VISIBLE_LABEL = "show";
    const AUTO_LABEL = "auto (default)";
    const TOTAL_LABELS_TEXT = "Total Labels";
    const DISABLED_TOOLTIP = "Property is not applicable for this configuration of the visualization";

    const defaultProps = {
        properties: {},
        pushData: () => {},
        isDisabled: false,
    };

    function createComponent(customProps: Partial<IDataLabelsControlProps> = {}) {
        const props = { ...defaultProps, ...customProps };
        return render(
            <InternalIntlWrapper>
                <DataLabelsControl {...props} />
            </InternalIntlWrapper>,
        );
    }

    const visibleValueToText = (value: IDataLabelsVisible) => {
        switch (value) {
            case true:
                return VISIBLE_LABEL;
            case false:
                return HIDE_LABEL;
            case "auto":
                return AUTO_LABEL;
            default:
                return ""; // Todo: fix this
        }
    };

    describe("Rendering", () => {
        it("should render data labels control", () => {
            createComponent();
            expect(screen.getByText("Data Labels")).toBeInTheDocument();
        });

        it("should render dropdown as disabled when disabled", () => {
            createComponent({
                isDisabled: true,
            });
            expect(screen.getByRole("combobox")).toHaveClass("disabled");
        });

        it("should have `auto` by default", () => {
            createComponent();
            expect(screen.queryByText(AUTO_LABEL)).toBeInTheDocument();
        });

        it("should show value that was passed", () => {
            createComponent({
                properties: {
                    controls: {
                        dataLabels: {
                            visible: true,
                        },
                    },
                },
            });

            expect(screen.queryByText(VISIBLE_LABEL)).toBeInTheDocument();
        });

        it.each([
            [true, true],
            [true, false],
            ["auto", true],
            [false, "auto"],
        ])(
            "should render dropdowns based on the provided values (visible: %s, totalsVisible: %s)",
            (visible: IDataLabelsVisible, totalsVisible: IDataLabelsVisible) => {
                const { getAllByRole } = createComponent({
                    enableSeparateTotalLabels: true,
                    properties: {
                        controls: {
                            dataLabels: {
                                visible,
                                totalsVisible,
                            },
                        },
                    },
                });
                const buttons = getAllByRole("combobox");
                expect(buttons[0]).toHaveTextContent(visibleValueToText(visible));
                expect(buttons[1]).toHaveTextContent(visibleValueToText(totalsVisible));
            },
        );

        it("should render total labels dropdown as disabled when isTotalsDisabled is true", () => {
            createComponent({
                isTotalsDisabled: true,
                enableSeparateTotalLabels: true,
            });

            const buttons = screen.getAllByRole("combobox");
            expect(buttons[0]).not.toHaveClass("disabled");
            expect(buttons[1]).toHaveClass("disabled");
        });

        it("should show the tooltip while hover on the disabled total labels control", async () => {
            createComponent({
                isTotalsDisabled: true,
                enableSeparateTotalLabels: true,
            });

            fireEvent.mouseEnter(screen.queryByText(TOTAL_LABELS_TEXT));

            await waitFor(() => {
                expect(screen.getByText(DISABLED_TOOLTIP)).toBeInTheDocument();
            });
        });
    });
});
