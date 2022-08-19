// (C) 2019-2022 GoodData Corporation
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import noop from "lodash/noop";
import cloneDeep from "lodash/cloneDeep";
import set from "lodash/set";

import { InternalIntlWrapper } from "../../../../utils/internalIntlProvider";
import LabelRotationControl, { ILabelRotationControl } from "../LabelRotationControl";

const defaultProps: ILabelRotationControl = {
    disabled: true,
    configPanelDisabled: false,
    properties: {},
    axis: "xaxis",
    pushData: noop,
};

function createComponent(customProps: Partial<ILabelRotationControl> = {}) {
    const props: ILabelRotationControl = { ...cloneDeep(defaultProps), ...customProps };
    return render(
        <InternalIntlWrapper>
            <LabelRotationControl {...props} />
        </InternalIntlWrapper>,
    );
}

describe("LabelRotationControl render", () => {
    it("should render", () => {
        createComponent();
        expect(screen.queryByText("Rotation")).toBeInTheDocument();
    });

    it("When LabelRotationControl disabled true" + "should be disable", () => {
        const xaxisVisible = set({}, "controls.xaxis.visible", true);

        createComponent({
            disabled: true,
            properties: xaxisVisible,
        });

        expect(screen.queryByTitle("auto (default)")).toHaveClass("disabled");
    });

    it("When LabelRotationControl disabled false and xaxis is not visible" + "should be disable", () => {
        const xaxisVisible = set({}, "controls.xaxis.visible", false);

        createComponent({
            disabled: false,
            properties: xaxisVisible,
        });

        expect(screen.queryByTitle("auto (default)")).toHaveClass("disabled");
    });

    it(
        "When LabelRotationControl disabled false and xaxis is visible and axisLabelsEnabled is false" +
            "(it is switch off) than should be disable",
        () => {
            const xaxisVisible = set({}, "controls.xaxis.visible", true);
            const axisLabelsEnabled = set(xaxisVisible, "controls.xaxis.labelsEnabled", false);

            createComponent({
                disabled: true,
                properties: axisLabelsEnabled,
            });

            expect(screen.queryByTitle("auto (default)")).toHaveClass("disabled");
        },
    );

    it(
        "When LabelRotationControl disabled false and xaxisis visible and axisLabelsEnabled is true" +
            "should not be disable",
        () => {
            const xaxisVisible = set({}, "controls.xaxis.visible", true);
            const properties = set(xaxisVisible, "controls.xaxis.labelsEnabled", true);

            createComponent({
                disabled: false,
                properties: properties,
            });

            expect(screen.queryByTitle("auto (default)")).not.toHaveClass("disabled");
        },
    );

    it("should call pushData when click on list item", async () => {
        const pushData = jest.fn();
        const xaxisVisible = set({}, "controls.xaxis.visible", true);
        const properties = set(xaxisVisible, "controls.xaxis.labelsEnabled", true);

        createComponent({
            disabled: false,
            properties,
            pushData,
        });

        await userEvent.click(screen.getByText("auto (default)"));

        await userEvent.click(screen.getByText("30°"));
        await waitFor(() => {
            expect(pushData).toBeCalledWith(
                expect.objectContaining({
                    properties: {
                        controls: { xaxis: { rotation: "30", labelsEnabled: true, visible: true } },
                    },
                }),
            );
        });
    });
});
