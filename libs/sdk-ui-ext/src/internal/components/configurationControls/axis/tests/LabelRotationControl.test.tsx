// (C) 2019-2022 GoodData Corporation
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import defaultUserEvent from "@testing-library/user-event";
import noop from "lodash/noop.js";
import cloneDeep from "lodash/cloneDeep.js";
import set from "lodash/set.js";
import { describe, it, expect, vi } from "vitest";
import { defaultImport } from "default-import";

import { InternalIntlWrapper } from "../../../../utils/internalIntlProvider.js";
import LabelRotationControl, { ILabelRotationControl } from "../LabelRotationControl.js";

// There are known compatibility issues between CommonJS (CJS) and ECMAScript modules (ESM).
// In ESM, default exports of CJS modules are wrapped in default properties instead of being exposed directly.
// https://github.com/microsoft/TypeScript/issues/52086#issuecomment-1385978414
const userEvent = defaultImport(defaultUserEvent);

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
        const pushData = vi.fn();
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
