// (C) 2019-2022 GoodData Corporation
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import defaultUserEvent from "@testing-library/user-event";
import noop from "lodash/noop.js";
import cloneDeep from "lodash/cloneDeep.js";
import set from "lodash/set.js";
import { describe, it, expect, vi } from "vitest";
import { defaultImport } from "default-import";

import LabelSubsection, { ILabelSubsection } from "../LabelSubsection.js";

import { InternalIntlWrapper } from "../../../../utils/internalIntlProvider.js";

// There are known compatibility issues between CommonJS (CJS) and ECMAScript modules (ESM).
// In ESM, default exports of CJS modules are wrapped in default properties instead of being exposed directly.
// https://github.com/microsoft/TypeScript/issues/52086#issuecomment-1385978414
const userEvent = defaultImport(defaultUserEvent);

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
    return render(
        <InternalIntlWrapper>
            <LabelSubsection {...props} />
        </InternalIntlWrapper>,
    );
}

describe("LabelSection render", () => {
    it("should render label section", () => {
        createComponent();
        expect(screen.queryByText("labels")).toBeInTheDocument();
    });

    it(
        "When LabelSubsection disabled true and xaxis is visible then " +
            "ConfigSubsection should be disabled",
        () => {
            const xaxisVisible = set({}, "controls.xaxis.visible", true);

            createComponent({
                disabled: true,
                configPanelDisabled: false,
                properties: xaxisVisible,
            });

            expect(screen.getByRole("checkbox")).toBeDisabled();
        },
    );

    it(
        "When LabelSubsection disabled true and xaxis is visible then " +
            "LabelRotationControl should be disabled",
        () => {
            const xaxisVisible = set({}, "controls.xaxis.visible", true);

            createComponent({
                disabled: true,
                configPanelDisabled: false,
                properties: xaxisVisible,
            });

            expect(screen.queryByTitle("auto (default)")).toHaveClass("disabled");
        },
    );

    it("When xaxis is not visible then " + "ConfigSubsection should be disabled", () => {
        const xaxisVisible = set({}, "controls.xaxis.visible", false);

        createComponent({
            disabled: false,
            configPanelDisabled: false,
            properties: xaxisVisible,
        });

        expect(screen.getByRole("checkbox")).toBeDisabled();
    });

    it("should not render LabelFormatControl when showFormat prop is false", () => {
        createComponent({
            disabled: false,
            configPanelDisabled: false,
            showFormat: false,
        });

        expect(screen.queryByText("Format")).not.toBeInTheDocument();
    });

    it("should render LabelFormatControl when showFormat prop is true", () => {
        createComponent({
            disabled: false,
            configPanelDisabled: false,
            showFormat: true,
        });

        expect(screen.getByText("Format")).toBeInTheDocument();
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

        await userEvent.click(screen.getByRole("checkbox"));

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
