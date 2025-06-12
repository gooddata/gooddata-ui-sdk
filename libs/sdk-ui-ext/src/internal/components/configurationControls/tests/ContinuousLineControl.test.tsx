// (C) 2019-2023 GoodData Corporation
import React from "react";
import { render, screen } from "@testing-library/react";
import defaultUserEvent from "@testing-library/user-event";
import noop from "lodash/noop.js";
import set from "lodash/set.js";

import { InternalIntlWrapper } from "../../../utils/internalIntlProvider.js";
import ContinuousLineControl, { IContinuousLineControlProps } from "../ContinuousLineControl.js";
import { describe, it, expect, vi } from "vitest";
import { defaultImport } from "default-import";

// There are known compatibility issues between CommonJS (CJS) and ECMAScript modules (ESM).
// In ESM, default exports of CJS modules are wrapped in default properties instead of being exposed directly.
// https://github.com/microsoft/TypeScript/issues/52086#issuecomment-1385978414
const userEvent = defaultImport(defaultUserEvent);

describe("ContinuousLineControl", () => {
    const defaultProps = {
        properties: {},
        propertiesMeta: {},
        pushData: noop,
    };

    function createComponent(customProps: Partial<IContinuousLineControlProps> = {}) {
        const props = { ...defaultProps, ...customProps };
        return render(
            <InternalIntlWrapper>
                <ContinuousLineControl {...props} />
            </InternalIntlWrapper>,
        );
    }

    it("should render checkbox control", () => {
        createComponent();
        expect(screen.getByRole("checkbox")).toBeInTheDocument();
    });

    it("should be unchecked by default", () => {
        createComponent();
        expect(screen.getByRole("checkbox")).not.toBeChecked();
    });

    it("should be enabled by default", () => {
        createComponent();
        expect(screen.getByRole("checkbox")).toBeEnabled();
    });

    it("should render checked checkbox", () => {
        createComponent({ checked: true });
        expect(screen.getByRole("checkbox")).toBeChecked();
    });

    it("should render disabled checkbox", () => {
        createComponent({ disabled: true });
        expect(screen.getByRole("checkbox")).toBeDisabled();
    });

    it("should call pushData when checkbox value changes", async () => {
        const pushData = vi.fn();
        createComponent({
            properties: {},
            pushData,
        });

        await userEvent.click(screen.getByRole("checkbox"));
        expect(pushData).toBeCalledWith({ properties: set({}, `controls.continuousLine.enabled`, true) });
    });

    it("should display the tooltip when hovering to the checkbox", async () => {
        const pushData = vi.fn();
        createComponent({
            properties: {},
            pushData,
        });

        await userEvent.hover(screen.getByRole("checkbox"));
        expect(document.querySelector(".content").innerHTML).toEqual(
            "Draw a line between points with missing values.",
        );
    });
});
