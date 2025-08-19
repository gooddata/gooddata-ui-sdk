// (C) 2021-2025 GoodData Corporation
import React from "react";

import { render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import cloneDeep from "lodash/cloneDeep.js";
import noop from "lodash/noop.js";
import { describe, expect, it, vi } from "vitest";

import { InternalIntlWrapper } from "../../../../utils/internalIntlProvider.js";
import ForecastConfidenceControl, { IForecastConfidenceControl } from "../ForecastConfidenceControl.js";

const defaultProps: IForecastConfidenceControl = {
    disabled: true,
    value: 0.95,
    properties: {},
    showDisabledMessage: false,
    pushData: noop,
};

function createComponent(customProps: Partial<IForecastConfidenceControl> = {}) {
    const props: IForecastConfidenceControl = { ...cloneDeep(defaultProps), ...customProps };
    return render(
        <InternalIntlWrapper>
            <ForecastConfidenceControl {...props} />
        </InternalIntlWrapper>,
    );
}

describe("ForecastConfidenceControl render", () => {
    it("should render", () => {
        createComponent();

        expect(screen.queryByText("Confidence")).toBeInTheDocument();
    });

    it("should be disabled", () => {
        createComponent({
            disabled: true,
        });

        expect(screen.queryByTitle("95%")).toHaveClass("disabled");
    });

    it("should contains all defined confidence levels", async () => {
        createComponent({
            disabled: false,
        });

        await userEvent.click(screen.getByText("95%"));

        await waitFor(() => {
            expect(screen.queryByText("70%")).toBeInTheDocument();
            expect(screen.queryByText("75%")).toBeInTheDocument();
            expect(screen.queryByText("80%")).toBeInTheDocument();
            expect(screen.queryByText("85%")).toBeInTheDocument();
            expect(screen.queryByText("90%")).toBeInTheDocument();
            expect(screen.queryAllByText("95%").length).toBe(2);
        });
    });

    it("should call pushData when click on list item", async () => {
        const pushData = vi.fn();

        createComponent({
            disabled: false,
            pushData,
        });

        await userEvent.click(screen.getByText("95%"));

        await userEvent.click(screen.getByText("70%"));
        await waitFor(() => {
            expect(pushData).toBeCalledWith(
                expect.objectContaining({
                    properties: {
                        controls: { forecast: { confidence: 0.7 } },
                    },
                }),
            );
        });
    });
});
