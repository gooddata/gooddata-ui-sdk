// (C) 2020-2025 GoodData Corporation

import { render, screen } from "@testing-library/react";
import { noop } from "lodash-es";
import { describe, expect, it } from "vitest";

import { InternalIntlWrapper } from "../../../utils/internalIntlProvider.js";
import PushpinSizeControl, { IPushpinSizeControl } from "../PushpinSizeControl.js";

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
