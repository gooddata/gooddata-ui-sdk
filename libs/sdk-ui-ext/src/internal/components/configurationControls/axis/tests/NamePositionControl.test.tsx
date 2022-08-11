// (C) 2019-2022 GoodData Corporation
import React from "react";
import { waitFor } from "@testing-library/react";
import set from "lodash/set";
import noop from "lodash/noop";

import NamePositionControl from "../NamePositionControl";

import { InternalIntlWrapper } from "../../../../utils/internalIntlProvider";
import { IConfigItemSubsection } from "../../../../interfaces/ConfigurationPanel";
import { setupComponent } from "../../../../tests/testHelper";

const defaultProps: IConfigItemSubsection = {
    disabled: true,
    configPanelDisabled: false,
    properties: {},
    axis: "xaxis",
    pushData: noop,
};

function createComponent(customProps: Partial<IConfigItemSubsection> = {}) {
    const props: IConfigItemSubsection = { ...defaultProps, ...customProps };
    return setupComponent(
        <InternalIntlWrapper>
            <NamePositionControl {...props} />
        </InternalIntlWrapper>,
    );
}

describe("NamePositionControl render", () => {
    it("should render", () => {
        const { getByText } = createComponent();
        expect(getByText("Position")).toBeInTheDocument();
    });

    it("should be disabled when xaxis is not visible", () => {
        const xaxisVisible = set({}, "controls.xaxis.visible", false);

        const { getByTitle } = createComponent({
            disabled: false,
            properties: xaxisVisible,
        });

        expect(getByTitle("auto (default)")).toHaveClass("disabled");
    });

    it("should be disabled when xaxis is visible and axisLabelsEnabled is false", () => {
        const xaxisVisible = set({}, "controls.xaxis.visible", true);
        const axisLabelsEnabled = set(xaxisVisible, "controls.xaxis.labelsEnabled", false);

        const { getByTitle } = createComponent({
            properties: axisLabelsEnabled,
        });

        expect(getByTitle("auto (default)")).toHaveClass("disabled");
    });

    it("should call pushData when click on list item", async () => {
        const pushData = jest.fn();
        const xaxisVisible = set({}, "controls.xaxis.visible", true);
        const properties = set(xaxisVisible, "controls.xaxis.labelsEnabled", true);

        const { getByText, user } = createComponent({
            disabled: false,
            properties,
            pushData,
        });

        await user.click(getByText("auto (default)"));

        await user.click(getByText("left"));
        await waitFor(() => {
            expect(pushData).toBeCalledWith(
                expect.objectContaining({
                    properties: {
                        controls: {
                            xaxis: { name: { position: "left" }, labelsEnabled: true, visible: true },
                        },
                    },
                }),
            );
        });
    });
});
