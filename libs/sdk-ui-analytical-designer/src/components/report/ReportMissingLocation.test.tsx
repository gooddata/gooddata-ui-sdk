// (C) 2020-2026 GoodData Corporation

import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { withIntl } from "../../utils/with_intl.js";

import { ReportMissingLocation } from "./ReportMissingLocation.js";

describe("ReportMissingLocation", () => {
    function renderReportMessage() {
        const Wrapped = withIntl(ReportMissingLocation);
        return render(<Wrapped />);
    }

    it("should render title and description", () => {
        const { container } = renderReportMessage();
        expect(container.querySelectorAll(".s-report-message-title").length).toBe(1);
        expect(container.querySelectorAll(".s-report-message-description").length).toBe(1);
        expect(container.querySelectorAll("div.s-error-missing-location").length).toBe(1);
        expect(container.querySelectorAll(".s-report-message-type-missing_location").length).toBe(1);
    });
});
