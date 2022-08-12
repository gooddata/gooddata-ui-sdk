// (C) 2019-2022 GoodData Corporation
import React from "react";
import noop from "lodash/noop";
import DataLabelsControl, { IDataLabelsControlProps } from "../DataLabelsControl";
import { InternalIntlWrapper } from "../../../utils/internalIntlProvider";
import { IDataLabelsVisible } from "@gooddata/sdk-ui-charts";
import { setupComponent } from "../../../tests/testHelper";

describe("DataLabelsControl", () => {
    const HIDE_LABEL = "hide";
    const VISIBLE_LABEL = "show";
    const AUTO_LABEL = "auto (default)";

    const defaultProps = {
        properties: {},
        pushData: noop,
        isDisabled: false,
    };

    function createComponent(customProps: Partial<IDataLabelsControlProps> = {}) {
        const props = { ...defaultProps, ...customProps };
        return setupComponent(
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
        }
    };

    describe("Rendering", () => {
        it("should render data labels control", () => {
            const { getByText } = createComponent();
            expect(getByText("Data Labels")).toBeInTheDocument();
        });

        it("should render dropdown as disabled when disabled", () => {
            const { getByRole } = createComponent({
                isDisabled: true,
            });
            expect(getByRole("button")).toHaveClass("disabled");
        });

        it("should have `auto` by default", () => {
            const { queryByText } = createComponent();
            expect(queryByText(AUTO_LABEL)).toBeInTheDocument();
        });

        it("should show value that was passed", () => {
            const { queryByText } = createComponent({
                properties: {
                    controls: {
                        dataLabels: {
                            visible: true,
                        },
                    },
                },
            });

            expect(queryByText(VISIBLE_LABEL)).toBeInTheDocument();
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
                const buttons = getAllByRole("button");
                expect(buttons[0]).toHaveTextContent(visibleValueToText(visible));
                expect(buttons[1]).toHaveTextContent(visibleValueToText(totalsVisible));
            },
        );
    });
});
