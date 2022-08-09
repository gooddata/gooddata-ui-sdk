// (C) 2019-2022 GoodData Corporation
import React from "react";
import { waitFor } from "@testing-library/react";
import noop from "lodash/noop";
import cloneDeep from "lodash/cloneDeep";
import set from "lodash/set";

import LabelSubsection, { ILabelSubsection } from "../LabelSubsection";

import { InternalIntlWrapper } from "../../../../utils/internalIntlProvider";
import { setupComponent } from "../../../../tests/testHelper";

const defaultProps: ILabelSubsection = {
    disabled: true,
    configPanelDisabled: false,
    properties: {},
    axis: "xaxis",
    pushData: noop,
    showFormat: false,
};

function createComponent(customProps: Partial<ILabelSubsection> = {}) {
    const props: ILabelSubsection = { ...cloneDeep(defaultProps), ...customProps };
    return setupComponent(
        <InternalIntlWrapper>
            <LabelSubsection {...props} />
        </InternalIntlWrapper>,
    );
}

describe("LabelSection render", () => {
    it("should render label section", () => {
        const { queryByText } = createComponent();
        expect(queryByText("labels")).toBeInTheDocument();
    });

    it(
        "When LabelSubsection disabled true and xaxis is visible then " +
            "ConfigSubsection should be disabled",
        () => {
            const xaxisVisible = set({}, "controls.xaxis.visible", true);

            const { getByRole } = createComponent({
                disabled: true,
                configPanelDisabled: false,
                properties: xaxisVisible,
            });

            expect(getByRole("checkbox")).toBeDisabled();
        },
    );

    it(
        "When LabelSubsection disabled true and xaxis is visible then " +
            "LabelRotationControl should be disabled",
        () => {
            const xaxisVisible = set({}, "controls.xaxis.visible", true);

            const { queryByTitle } = createComponent({
                disabled: true,
                configPanelDisabled: false,
                properties: xaxisVisible,
            });

            expect(queryByTitle("auto (default)")).toHaveClass("disabled");
        },
    );

    it("When xaxis is not visible then " + "ConfigSubsection should be disabled", () => {
        const xaxisVisible = set({}, "controls.xaxis.visible", false);

        const { getByRole } = createComponent({
            disabled: false,
            configPanelDisabled: false,
            properties: xaxisVisible,
        });

        expect(getByRole("checkbox")).toBeDisabled();
    });

    it("should not render LabelFormatControl when showFormat prop is false", () => {
        const { queryByText } = createComponent({
            disabled: false,
            configPanelDisabled: false,
            showFormat: false,
        });

        expect(queryByText("Format")).not.toBeInTheDocument();
    });

    it("should render LabelFormatControl when showFormat prop is true", () => {
        const { getByText } = createComponent({
            disabled: false,
            configPanelDisabled: false,
            showFormat: true,
        });

        expect(getByText("Format")).toBeInTheDocument();
    });
});

describe("Toggle switch", () => {
    it("should call pushData when click on toggle switch with valuePath set", async () => {
        const pushData = jest.fn();
        const xaxisVisible = set({}, "controls.xaxis.visible", true);
        const axisLabelsEnabled = set(xaxisVisible, "controls.xaxis.labelsEnabled", false);

        const { getByRole, user } = createComponent({
            disabled: false,
            configPanelDisabled: false,
            properties: axisLabelsEnabled,
            pushData,
        });

        await user.click(getByRole("checkbox"));

        await waitFor(() => {
            expect(pushData).toBeCalledWith(
                expect.objectContaining({
                    properties: {
                        controls: { xaxis: { labelsEnabled: true, visible: true } },
                    },
                }),
            );
        });
    });
});
