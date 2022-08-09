// (C) 2019-2022 GoodData Corporation
import React from "react";
import { waitFor } from "@testing-library/react";
import cloneDeep from "lodash/cloneDeep";
import set from "lodash/set";
import noop from "lodash/noop";

import NameSubsection from "../NameSubsection";

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
    const props: IConfigItemSubsection = { ...cloneDeep(defaultProps), ...customProps };
    return setupComponent(
        <InternalIntlWrapper>
            <NameSubsection {...props} />
        </InternalIntlWrapper>,
    );
}

describe("LegendSection render", () => {
    it("should render legend section", () => {
        const { getByText } = createComponent();
        expect(getByText("name")).toBeInTheDocument();
    });

    it("should ConfigSubsection be disabled when NameSubsection disabled is true and xaxis is visible", () => {
        const xaxisVisible = set({}, "controls.xaxis.visible", true);

        const { getByRole } = createComponent({
            disabled: true,
            configPanelDisabled: false,
            properties: xaxisVisible,
        });

        expect(getByRole("checkbox")).toBeDisabled();
    });

    it("should NamePositionControl be disabled when NameSubsection disabled is true and xaxis is visible", () => {
        const xaxisVisible = set({}, "controls.xaxis.visible", true);

        const { getByTitle } = createComponent({
            disabled: true,
            configPanelDisabled: false,
            properties: xaxisVisible,
        });

        expect(getByTitle("auto (default)")).toHaveClass("disabled");
    });

    it("should ConfigSubsection be disabled when xaxis is not visible", () => {
        const xaxisVisible = set({}, "controls.xaxis.visible", false);

        const { getByRole } = createComponent({
            disabled: false,
            configPanelDisabled: false,
            properties: xaxisVisible,
        });

        expect(getByRole("checkbox")).toBeDisabled();
    });
});

describe("Toggle switch", () => {
    it("should call pushData when click on toggle switch with valuePath set", async () => {
        const pushData = jest.fn();
        const xaxisVisible = set({}, "controls.xaxis.visible", true);
        const axisLabelsEnabled = set(xaxisVisible, "controls.xaxis.labelsEnabled", false);

        const { getByText, user } = createComponent({
            disabled: false,
            configPanelDisabled: false,
            properties: axisLabelsEnabled,
            pushData,
        });

        await user.click(getByText("auto (default)"));

        await user.click(getByText("center"));

        await waitFor(() => {
            expect(pushData).toBeCalledWith(
                expect.objectContaining({
                    properties: {
                        controls: {
                            xaxis: { name: { position: "center" }, labelsEnabled: false, visible: true },
                        },
                    },
                }),
            );
        });
    });
});
