// (C) 2019-2022 GoodData Corporation
import React from "react";
import noop from "lodash/noop.js";
import { render, screen, waitFor } from "@testing-library/react";
import defaultUserEvent from "@testing-library/user-event";
import { describe, it, expect } from "vitest";
import { defaultImport } from "default-import";

import { RepeatPeriodSelect, IRepeatPeriodSelectProps } from "../RepeatPeriodSelect.js";

import { IntlWrapper } from "../../../../../localization/IntlWrapper.js";

// There are known compatibility issues between CommonJS (CJS) and ECMAScript modules (ESM).
// In ESM, default exports of CJS modules are wrapped in default properties instead of being exposed directly.
// https://github.com/microsoft/TypeScript/issues/52086#issuecomment-1385978414
const userEvent = defaultImport(defaultUserEvent);

describe("RepeatPeriodSelect", () => {
    function renderComponent(customProps: Partial<IRepeatPeriodSelectProps> = {}) {
        const defaultProps = {
            repeatPeriod: 1,
            onChange: noop,
            ...customProps,
        };

        return render(
            <IntlWrapper>
                <RepeatPeriodSelect {...defaultProps} />
            </IntlWrapper>,
        );
    }

    it("should render component", () => {
        renderComponent();

        expect(screen.getByDisplayValue("1")).toBeInTheDocument();
    });

    it("should render correct period", () => {
        const repeatPeriod = 5;
        renderComponent({
            repeatPeriod,
        });
        expect(screen.getByDisplayValue(`${repeatPeriod}`)).toBeInTheDocument();
    });

    it("should change input value when valid value is provided", async () => {
        const repeatPeriod = 5;
        renderComponent({
            repeatPeriod,
        });

        await userEvent.type(screen.getByDisplayValue(`${repeatPeriod}`), "test");
        await waitFor(() => {
            expect(screen.queryByDisplayValue("test")).not.toBeInTheDocument();
        });

        await userEvent.clear(screen.getByRole("textbox"));
        await userEvent.type(screen.getByRole("textbox"), "2");
        await waitFor(() => {
            expect(screen.queryByDisplayValue("2")).toBeInTheDocument();
        });
    });
});
