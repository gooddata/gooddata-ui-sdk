// (C) 2021-2022 GoodData Corporation
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import noop from "lodash/noop";
import cloneDeep from "lodash/cloneDeep";
import set from "lodash/set";

import { ILabelFormatControl, LabelFormatControl } from "../LabelFormatControl";

import { InternalIntlWrapper } from "../../../../utils/internalIntlProvider";

const defaultProps: ILabelFormatControl = {
    disabled: true,
    configPanelDisabled: false,
    properties: {},
    axis: "xaxis",
    pushData: noop,
};

function createComponent(customProps: Partial<ILabelFormatControl> = {}) {
    const props: ILabelFormatControl = { ...cloneDeep(defaultProps), ...customProps };
    return render(
        <InternalIntlWrapper>
            <LabelFormatControl {...props} />
        </InternalIntlWrapper>,
    );
}

describe("LabelFormatControl render", () => {
    it("should render", () => {
        createComponent();

        expect(screen.queryByText("Format")).toBeInTheDocument();
    });

    it("should be disabled when xaxis is not visible", () => {
        const xaxisVisible = set({}, "controls.xaxis.visible", false);
        const properties = set(xaxisVisible, "controls.xaxis.labelsEnabled", true);

        createComponent({
            disabled: false,
            properties: properties,
        });

        expect(screen.queryByTitle("auto (default)")).toHaveClass("disabled");
    });

    it("should be disabled when xaxis labels are not enabled", () => {
        const xaxisVisible = set({}, "controls.xaxis.visible", true);
        const properties = set(xaxisVisible, "controls.xaxis.labelsEnabled", false);

        createComponent({
            disabled: false,
            properties: properties,
        });

        expect(screen.queryByTitle("auto (default)")).toHaveClass("disabled");
    });

    it("should not be disabled when control is not disabled, xaxis is visible and xaxis labels are enabled", async () => {
        const xaxisVisible = set({}, "controls.xaxis.visible", true);
        const properties = set(xaxisVisible, "controls.xaxis.labelsEnabled", true);

        createComponent({
            disabled: false,
            properties: properties,
        });

        await userEvent.click(screen.getByText("auto (default)"));

        expect(screen.queryByText("inherit")).toBeInTheDocument();
        expect(screen.queryByTitle("auto (default)")).not.toHaveClass("disabled");
    });

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

        await userEvent.click(screen.getByText("inherit"));
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
