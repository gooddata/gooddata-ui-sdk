// (C) 2021-2025 GoodData Corporation
import { IntlProvider } from "react-intl";
import { render, screen } from "@testing-library/react";
import {
    GoodDataSdkError,
    DataTooLargeToComputeSdkError,
    DataTooLargeToDisplaySdkError,
    NoDataSdkError,
    ProtectedReportSdkError,
    UnexpectedSdkError,
} from "@gooddata/sdk-ui";
import { describe, it, expect } from "vitest";

import { CustomError } from "../CustomError.js";
import { DataTooLargeError } from "../DataTooLargeError.js";
import { OtherError } from "../OtherError.js";
import { NoDataError } from "../NoDataError.js";
import { ExecuteProtectedError } from "../ExecuteProtectedError.js";

const DefaultLocale = "en-US";

const messages = {
    "visualization.execute_protected_report.headline": "Protected Headline",
    "visualization.execute_protected_report.text": "Protected Text",
    "visualization.dataTooLarge.headline": "Data too large Headline",
    "visualization.dataTooLarge.text": "Data too large Text",
    "visualization.empty.headline": "Empty Headline",
    "visualization.error.headline": "Other Error Headline",
    "visualization.error.text": "Other Error Text",
};

describe("CustomError", () => {
    function renderComponent(error: GoodDataSdkError) {
        return render(
            <IntlProvider key={DefaultLocale} locale={DefaultLocale} messages={messages}>
                <CustomError error={error} />
            </IntlProvider>,
        );
    }

    it.each([
        [
            ProtectedReportSdkError.name,
            ExecuteProtectedError,
            new ProtectedReportSdkError(),
            "Protected Headline",
            "Protected Text",
        ],
        [
            DataTooLargeToDisplaySdkError.name,
            DataTooLargeError,
            new DataTooLargeToDisplaySdkError(),
            "Data too large Headline",
            "Data too large Text",
        ],
        [
            DataTooLargeToComputeSdkError.name,
            DataTooLargeError,
            new DataTooLargeToComputeSdkError(),
            "Data too large Headline",
            "Data too large Text",
        ],
        [NoDataSdkError.name, NoDataError, new NoDataSdkError(), "Empty Headline", ""],
        [
            UnexpectedSdkError.name,
            OtherError,
            new UnexpectedSdkError(),
            "Other Error Headline",
            "Other Error Text",
        ],
    ])(
        "should render correct error component for %s error",
        (_errorName: string, component: any, error: GoodDataSdkError, headline: string, text: string) => {
            renderComponent(error);

            expect(screen.getByText(headline)).toBeInTheDocument();
            if (component !== NoDataError) {
                expect(screen.getByText(text)).toBeInTheDocument();
            }
        },
    );
});
