// (C) 2019-2025 GoodData Corporation
import React from "react";

import { render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import noop from "lodash/noop.js";
import set from "lodash/set.js";
import { describe, expect, it, vi } from "vitest";

import { IConfigItemSubsection } from "../../../../interfaces/ConfigurationPanel.js";
import { InternalIntlWrapper } from "../../../../utils/internalIntlProvider.js";
import NamePositionControl from "../NamePositionControl.js";

const defaultProps: IConfigItemSubsection = {
    disabled: true,
    configPanelDisabled: false,
    properties: {},
    axis: "xaxis",
    pushData: noop,
};

function createComponent(customProps: Partial<IConfigItemSubsection> = {}) {
    const props: IConfigItemSubsection = { ...defaultProps, ...customProps };
    return render(
        <InternalIntlWrapper>
            <NamePositionControl {...props} />
        </InternalIntlWrapper>,
    );
}

describe("NamePositionControl render", () => {
    it("should render", () => {
        createComponent();
        expect(screen.getByText("Position")).toBeInTheDocument();
    });

    it("should be disabled when xaxis is not visible", () => {
        const xaxisVisible = set({}, "controls.xaxis.visible", false);

        createComponent({
            disabled: false,
            properties: xaxisVisible,
        });

        expect(screen.getByTitle("auto (default)")).toHaveClass("disabled");
    });

    it("should be disabled when xaxis is visible and axisLabelsEnabled is false", () => {
        const xaxisVisible = set({}, "controls.xaxis.visible", true);
        const axisLabelsEnabled = set(xaxisVisible, "controls.xaxis.labelsEnabled", false);

        createComponent({
            properties: axisLabelsEnabled,
        });

        expect(screen.getByTitle("auto (default)")).toHaveClass("disabled");
    });

    it("should call pushData when click on list item", async () => {
        const pushData = vi.fn();
        const xaxisVisible = set({}, "controls.xaxis.visible", true);
        const properties = set(xaxisVisible, "controls.xaxis.labelsEnabled", true);

        createComponent({
            disabled: false,
            properties,
            pushData,
        });

        await userEvent.click(screen.getByText("auto (default)"));

        await userEvent.click(screen.getByText("left"));
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
