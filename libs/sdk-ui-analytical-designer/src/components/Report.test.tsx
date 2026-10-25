// (C) 2007-2026 GoodData Corporation

import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { delay } from "@gooddata/util";

import { withIntl } from "../utils/with_intl.js";
import { withRedux } from "../utils/with_redux.js";

import { type IReportProps, ReportBase } from "./Report.js";

vi.hoisted(() => {
    vi.resetModules();
});

vi.mock("./report/ReportVisualization", () => {
    function ReportVisualization() {
        return <div className="s-report-visualization" />;
    }
    return {
        __esModule: true,
        ReportVisualization,
    };
});

vi.mock("./report/PartialDataWarning", () => {
    function PartialDataWarning() {
        return <div className="s-partial-data-warning" />;
    }
    return {
        __esModule: true,
        PartialDataWarning,
    };
});

vi.mock("./report/ReportMissingMetric", () => {
    function ReportMissingMetric() {
        return <div className="s-report-missing-metric" />;
    }
    return {
        __esModule: true,
        ReportMissingMetric,
    };
});

vi.mock("./report/ReportHasNegativeValues", () => {
    function ReportHasNegativeValues() {
        return <div className="s-report-has-negative-values" />;
    }
    return {
        __esModule: true,
        ReportHasNegativeValues,
    };
});

vi.mock("./report/ReportTooLargeToCompute/ReportTooLargeToCompute", () => {
    function ReportTooLargeToCompute() {
        return <div className="s-report-too-large" />;
    }
    return {
        __esModule: true,
        ReportTooLargeToCompute,
    };
});

vi.mock("./report/ReportCustomError", () => {
    function ReportCustomError() {
        return <div className="s-report-custom-error" />;
    }
    return {
        __esModule: true,
        ReportCustomError,
    };
});

describe("Report", () => {
    const defaultProps: IReportProps = {
        projectId: "FoodMartDemo",
        appSessionId: "test",
        isExecutable: true,
    };

    const createComponent = (customProps = {}) => {
        const Component = withRedux(withIntl(ReportBase));
        return render(<Component {...defaultProps} {...customProps} />);
    };

    it("should render Report", async () => {
        const { container } = createComponent({ isReportNotFound: true });

        return delay().then(() => {
            expect(container.querySelectorAll(".invisible-report-visualization").length).toEqual(1);
        });
    });

    it("should show Report blank message", () => {
        const { container } = createComponent({ isExecutable: false });

        return delay().then(() => {
            expect(container.querySelectorAll(".s-error-report-blank").length).toEqual(1);
        });
    });

    it("should render report not found message", () => {
        const { container } = createComponent({ isReportNotFound: true });

        return delay().then(() => {
            expect(container.querySelectorAll("[data-testid='error-report-not-found']").length).toEqual(1);
        });
    });

    it("should name the missing date filter items on the report not found page", () => {
        const { container } = createComponent({
            isReportNotFound: true,
            reportNotFoundMissingItems: [
                {
                    datasetTitle: "Order date",
                    identifier: "order_date.minuteOfHour",
                    granularity: "GDC.time.minute_in_hour",
                },
                { datasetTitle: "Order date", identifier: "order_date.customLabel" },
            ],
        });

        return delay().then(() => {
            const page = container.querySelector("[data-testid='error-report-not-found']");
            expect(page?.textContent).toContain("Sorry, we can't display this visualization");
            expect(page?.textContent).toContain(
                "Order date - Minute of Hour, Order date - order_date.customLabel used in the date filter are no longer available.",
            );
        });
    });

    it("should use the singular wording for one missing date filter item", () => {
        const { container } = createComponent({
            isReportNotFound: true,
            reportNotFoundMissingItems: [
                { datasetTitle: "Order date", identifier: "order_date", granularity: "GDC.time.hour" },
            ],
        });

        return delay().then(() => {
            const page = container.querySelector("[data-testid='error-report-not-found']");
            expect(page?.textContent).toContain(
                "Order date - Hour used in the date filter is no longer available.",
            );
        });
    });

    it("should show report empty", () => {
        const { container } = createComponent({ isReportWithFiltersEmpty: true });

        return delay().then(() => {
            expect(container.querySelectorAll(".s-error-empty-result").length).toEqual(1);
        });
    });

    it("should show workspace empty message", () => {
        const { container } = createComponent({ isReportWithoutFiltersEmpty: true });

        return delay().then(() => {
            expect(container.querySelectorAll(".s-error-workspace-empty-result").length).toEqual(1);
        });
    });

    it("should show missing location message", async () => {
        const { container } = createComponent({ isMissingLocation: true });

        await delay();
        expect(container.querySelectorAll(".s-error-missing-location").length).toEqual(1);
    });

    it("should show missing area message", async () => {
        const { container } = createComponent({ isMissingArea: true });

        await delay();
        expect(container.querySelectorAll(".s-error-missing-area").length).toEqual(1);
    });

    it.each([
        ["not show", true, 0],
        ["show", false, 1],
    ])(
        "should %s missing metric message",
        async (_expectedText: string, isNoMetricSupported: boolean, expectedValue: number) => {
            const { container } = createComponent({
                isMissingMetric: true,
                isNoMetricSupported,
            });

            await delay();
            expect(container.querySelectorAll(".s-report-missing-metric").length).toEqual(expectedValue);
        },
    );

    it("should show negative values message", () => {
        const { container } = createComponent({ hasNegativeValue: true });

        return delay().then(() => {
            expect(container.querySelectorAll(".s-report-has-negative-values").length).toEqual(1);
        });
    });

    it("should show invalid configuration message", () => {
        const { container } = createComponent({ isInvalidConfiguration: true });

        return delay().then(() => {
            expect(container.querySelectorAll(".s-error-invalid-configuration").length).toEqual(1);
        });
    });

    it("should show unsupported configuration message", () => {
        const { container } = createComponent({ unsupportedConfiguration: true });

        return delay().then(() => {
            expect(container.querySelectorAll(".s-error-unsupported-configuration").length).toEqual(1);
        });
    });

    it("should not show unsupported configuration message for valid insight", () => {
        const { container } = createComponent();

        return delay().then(() => {
            expect(container.querySelectorAll(".s-error-unsupported-configuration").length).toEqual(0);
        });
    });

    it.each(["isExecutionRunning", "isReportTooLargeToCompute", "isBadRequest"])(
        "should show unsupported configuration message even if %s is true",
        (truthyParam) => {
            const { container } = createComponent({
                unsupportedConfiguration: true,
                [truthyParam]: true,
            });

            return delay().then(() => {
                expect(container.querySelectorAll(".s-error-unsupported-configuration").length).toEqual(1);
            });
        },
    );

    it("should show too large message", () => {
        const { container } = createComponent({
            isReportTooLargeToCompute: true,
        });

        return delay().then(() => {
            expect(container.querySelectorAll(".s-report-too-large").length).toEqual(1);
        });
    });

    it("should show computing message", () => {
        const { container } = createComponent({ isComputingShortcut: true });

        return delay().then(() => {
            expect(container.querySelectorAll(".s-report-computing").length).toEqual(1);
        });
    });

    it("should be able to render custom error message", () => {
        const { container } = createComponent({
            customError: {
                heading: "Custom Error Heading",
                text: "Custom Error {some_thing} Text",
            },
        });

        return delay().then(() => {
            const customErrorComponent = container.querySelectorAll(".s-report-custom-error");
            expect(customErrorComponent.length).toEqual(1);
        });
    });
});
