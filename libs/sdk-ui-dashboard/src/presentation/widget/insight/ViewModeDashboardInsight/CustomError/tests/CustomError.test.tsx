// (C) 2021-2022 GoodData Corporation
import React from "react";
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

import { CustomError } from "../CustomError";
import { DataTooLargeError } from "../DataTooLargeError";
import { OtherError } from "../OtherError";
import { NoDataError } from "../NoDataError";
import { ExecuteProtectedError } from "../ExecuteProtectedError";

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
