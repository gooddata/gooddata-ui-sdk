// (C) 2020-2025 GoodData Corporation
import React from "react";
import { render, screen } from "@testing-library/react";
import noop from "lodash/noop.js";
import { describe, it, expect } from "vitest";

import PushpinSizeControl, { IPushpinSizeControl } from "../PushpinSizeControl.js";
import { InternalIntlWrapper } from "../../../utils/internalIntlProvider.js";

describe("PushpinSizeControl", () => {
    const defaultProps = {
        disabled: false,
        properties: {},
        pushData: noop,
    };

    function createComponent(customProps: Partial<IPushpinSizeControl> = {}) {
        const props = { ...defaultProps, ...customProps };
        return render(
            <InternalIntlWrapper>
                <PushpinSizeControl {...props} />
            </InternalIntlWrapper>,
        );
    }

    describe("Rendering", () => {
        it("should render PushpinSizeControl", () => {
            createComponent();
            expect(screen.getByText("Point Size")).toBeInTheDocument();
        });

        it("should render disabled PushpinSizeControl", () => {
            const { getAllByRole } = createComponent({
                disabled: true,
            });

            const buttons = getAllByRole("combobox");
            buttons.forEach((item) => {
                expect(item).toHaveClass("disabled");
            });
        });
    });
});
