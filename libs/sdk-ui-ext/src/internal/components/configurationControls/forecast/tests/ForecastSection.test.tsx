// (C) 2021-2025 GoodData Corporation
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import noop from "lodash/noop.js";
import cloneDeep from "lodash/cloneDeep.js";
import { describe, it, expect, vi } from "vitest";

import ForecastSection, { IForecastSection } from "../ForecastSection.js";

import { InternalIntlWrapper } from "../../../../utils/internalIntlProvider.js";

const defaultProps: IForecastSection = {
    controlsDisabled: false,
    defaultForecastEnabled: false,
    properties: {},
    propertiesMeta: {},
    enabled: true,
    pushData: noop,
};

function createComponent(customProps: Partial<IForecastSection> = {}) {
    const props: IForecastSection = { ...cloneDeep(defaultProps), ...customProps };
    return render(
        <InternalIntlWrapper>
            <ForecastSection {...props} />
        </InternalIntlWrapper>,
    );
}

describe("ForecastSection render", () => {
    it("should render", async () => {
        createComponent();

        expect(screen.queryByText("Forecast")).toBeInTheDocument();

        await userEvent.click(screen.getByText("Forecast"));
        await waitFor(() => {
            expect(screen.queryByText("Period")).toBeInTheDocument();
            expect(screen.queryByText("Confidence")).toBeInTheDocument();
            expect(screen.queryByText("Seasonality")).toBeInTheDocument();
        });
    });

    it("should send period update", async () => {
        const pushData = vi.fn();

        createComponent({
            pushData,
            properties: {
                controls: {
                    forecast: {
                        enabled: true,
                    },
                },
            },
        });
        await userEvent.click(screen.getByText("Forecast"));

        await userEvent.clear(screen.getByPlaceholderText("Period"));
        await userEvent.type(screen.getByPlaceholderText("Period"), "4");

        await userEvent.click(screen.getByText("Period"));

        await waitFor(() => {
            expect(pushData).toBeCalledTimes(2);
            expect(pushData).toBeCalledWith(
                expect.objectContaining({
                    properties: {
                        controls: {
                            forecast: {
                                enabled: true,
                                period: "4",
                            },
                        },
                    },
                }),
            );
        });
    });

    it("should send confidence update", async () => {
        const pushData = vi.fn();

        createComponent({
            pushData,
            properties: {
                controls: {
                    forecast: {
                        enabled: true,
                    },
                },
            },
        });
        await userEvent.click(screen.getByText("Forecast"));

        await userEvent.click(screen.getByText("95%"));
        await userEvent.click(screen.getByText("70%"));

        await waitFor(() => {
            expect(pushData).toBeCalledTimes(2);
            expect(pushData).toBeCalledWith(
                expect.objectContaining({
                    properties: {
                        controls: {
                            forecast: {
                                enabled: true,
                                confidence: 0.7,
                            },
                        },
                    },
                }),
            );
        });
    });

    it("should send seasonality update", async () => {
        const pushData = vi.fn();

        createComponent({
            pushData,
            properties: {
                controls: {
                    forecast: {
                        enabled: true,
                    },
                },
            },
        });
        await userEvent.click(screen.getByText("Forecast"));

        await userEvent.click(screen.getByText("Seasonality"));

        await waitFor(() => {
            expect(pushData).toBeCalledTimes(2);
            expect(pushData).toBeCalledWith(
                expect.objectContaining({
                    properties: {
                        controls: {
                            forecast: {
                                enabled: true,
                                seasonal: true,
                            },
                        },
                    },
                }),
            );
        });
    });
});
