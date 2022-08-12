// (C) 2020-2022 GoodData Corporation
import React from "react";
import noop from "lodash/noop";

import PushpinSizeControl, { IPushpinSizeControl } from "../PushpinSizeControl";
import { InternalIntlWrapper } from "../../../utils/internalIntlProvider";
import { setupComponent } from "../../../tests/testHelper";

describe("PushpinSizeControl", () => {
    const defaultProps = {
        disabled: false,
        properties: {},
        pushData: noop,
    };

    function createComponent(customProps: Partial<IPushpinSizeControl> = {}) {
        const props = { ...defaultProps, ...customProps };
        return setupComponent(
            <InternalIntlWrapper>
                <PushpinSizeControl {...props} />
            </InternalIntlWrapper>,
        );
    }

    describe("Rendering", () => {
        it("should render PushpinSizeControl", () => {
            const { getByText } = createComponent();
            expect(getByText("Point Size")).toBeInTheDocument();
        });

        it("should render disabled PushpinSizeControl", () => {
            const { getAllByRole } = createComponent({
                disabled: true,
            });

            const buttons = getAllByRole("button");
            buttons.forEach((item) => {
                expect(item).toHaveClass("disabled");
            });
        });
    });
});
