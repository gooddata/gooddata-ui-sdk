// (C) 2019-2025 GoodData Corporation
import { render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import cloneDeep from "lodash/cloneDeep.js";
import set from "lodash/set.js";
import noop from "lodash/noop.js";
import { describe, it, expect, vi } from "vitest";

import NameSubsection from "../NameSubsection.js";

import { InternalIntlWrapper } from "../../../../utils/internalIntlProvider.js";
import { IConfigItemSubsection } from "../../../../interfaces/ConfigurationPanel.js";

const defaultProps: IConfigItemSubsection = {
    disabled: true,
    configPanelDisabled: false,
    properties: {},
    axis: "xaxis",
    pushData: noop,
};

function createComponent(customProps: Partial<IConfigItemSubsection> = {}) {
    const props: IConfigItemSubsection = { ...cloneDeep(defaultProps), ...customProps };
    return render(
        <InternalIntlWrapper>
            <NameSubsection {...props} />
        </InternalIntlWrapper>,
    );
}

describe("LegendSection render", () => {
    it("should render legend section", () => {
        createComponent();
        expect(screen.getByText("name")).toBeInTheDocument();
    });

    it("should ConfigSubsection be disabled when NameSubsection disabled is true and xaxis is visible", () => {
        const xaxisVisible = set({}, "controls.xaxis.visible", true);

        createComponent({
            disabled: true,
            configPanelDisabled: false,
            properties: xaxisVisible,
        });

        expect(screen.getByRole("checkbox")).toBeDisabled();
    });

    it("should NamePositionControl be disabled when NameSubsection disabled is true and xaxis is visible", () => {
        const xaxisVisible = set({}, "controls.xaxis.visible", true);

        createComponent({
            disabled: true,
            configPanelDisabled: false,
            properties: xaxisVisible,
        });

        expect(screen.getByTitle("auto (default)")).toHaveClass("disabled");
    });

    it("should ConfigSubsection be disabled when xaxis is not visible", () => {
        const xaxisVisible = set({}, "controls.xaxis.visible", false);

        createComponent({
            disabled: false,
            configPanelDisabled: false,
            properties: xaxisVisible,
        });

        expect(screen.getByRole("checkbox")).toBeDisabled();
    });
});

describe("Toggle switch", () => {
    it("should call pushData when click on toggle switch with valuePath set", async () => {
        const pushData = vi.fn();
        const xaxisVisible = set({}, "controls.xaxis.visible", true);
        const axisLabelsEnabled = set(xaxisVisible, "controls.xaxis.labelsEnabled", false);

        createComponent({
            disabled: false,
            configPanelDisabled: false,
            properties: axisLabelsEnabled,
            pushData,
        });

        await userEvent.click(screen.getByText("auto (default)"));

        await userEvent.click(screen.getByText("center"));

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
