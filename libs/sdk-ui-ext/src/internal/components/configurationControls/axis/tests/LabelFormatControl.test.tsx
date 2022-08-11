// (C) 2021-2022 GoodData Corporation
import React from "react";
import noop from "lodash/noop";
import cloneDeep from "lodash/cloneDeep";
import set from "lodash/set";
import { waitFor } from "@testing-library/react";

import { ILabelFormatControl, LabelFormatControl } from "../LabelFormatControl";

import { InternalIntlWrapper } from "../../../../utils/internalIntlProvider";
import { setupComponent } from "../../../../tests/testHelper";

const defaultProps: ILabelFormatControl = {
    disabled: true,
    configPanelDisabled: false,
    properties: {},
    axis: "xaxis",
    pushData: noop,
};

function createComponent(customProps: Partial<ILabelFormatControl> = {}) {
    const props: ILabelFormatControl = { ...cloneDeep(defaultProps), ...customProps };
    return setupComponent(
        <InternalIntlWrapper>
            <LabelFormatControl {...props} />
        </InternalIntlWrapper>,
    );
}

describe("LabelFormatControl render", () => {
    it("should render", () => {
        const { queryByText } = createComponent();

        expect(queryByText("Format")).toBeInTheDocument();
    });

    it("should be disabled when xaxis is not visible", () => {
        const xaxisVisible = set({}, "controls.xaxis.visible", false);
        const properties = set(xaxisVisible, "controls.xaxis.labelsEnabled", true);

        const { queryByTitle } = createComponent({
            disabled: false,
            properties: properties,
        });

        expect(queryByTitle("auto (default)")).toHaveClass("disabled");
    });

    it("should be disabled when xaxis labels are not enabled", () => {
        const xaxisVisible = set({}, "controls.xaxis.visible", true);
        const properties = set(xaxisVisible, "controls.xaxis.labelsEnabled", false);

        const { queryByTitle } = createComponent({
            disabled: false,
            properties: properties,
        });

        expect(queryByTitle("auto (default)")).toHaveClass("disabled");
    });

    it("should not be disabled when control is not disabled, xaxis is visible and xaxis labels are enabled", async () => {
        const xaxisVisible = set({}, "controls.xaxis.visible", true);
        const properties = set(xaxisVisible, "controls.xaxis.labelsEnabled", true);

        const { queryByText, queryByTitle, getByText, user } = createComponent({
            disabled: false,
            properties: properties,
        });

        await user.click(getByText("auto (default)"));

        expect(queryByText("inherit")).toBeInTheDocument();
        expect(queryByTitle("auto (default)")).not.toHaveClass("disabled");
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

        await user.click(getByText("inherit"));
        await waitFor(() => {
            expect(pushData).toBeCalledWith(
                expect.objectContaining({
                    properties: {
                        controls: { xaxis: { format: "inherit", labelsEnabled: true, visible: true } },
                    },
                }),
            );
        });
    });
});
