// (C) 2019-2022 GoodData Corporation
import React from "react";
import { render, screen } from "@testing-library/react";
import noop from "lodash/noop";

import { Input, IInputProps } from "../Input";
import { IntlWrapper } from "../../../../localization/IntlWrapper";

describe("Input", () => {
    function renderComponent(customProps: Partial<IInputProps> = {}) {
        const defaultProps = {
            label: "",
            maxlength: 100,
            placeholder: "",
            onChange: noop,
            ...customProps,
        };

        return render(
            <IntlWrapper>
                <Input {...defaultProps} />
            </IntlWrapper>,
        );
    }

    it("should render component", () => {
        renderComponent();
        expect(screen.getByRole("textbox")).toBeInTheDocument();
    });

    it("should render label", () => {
        const label = "subject";
        renderComponent({ label });
        expect(screen.getByText(label)).toBeInTheDocument();
    });
});
