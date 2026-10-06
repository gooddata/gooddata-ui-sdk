// (C) 2021-2026 GoodData Corporation

import { render, screen } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import { describe, expect, it, vi } from "vitest";

import { type IInsightWidget, idRef } from "@gooddata/sdk-model";
import {
    DataTooLargeToComputeSdkError,
    DataTooLargeToDisplaySdkError,
    type GoodDataSdkError,
    NoDataSdkError,
    ProtectedReportSdkError,
    UnexpectedSdkError,
} from "@gooddata/sdk-ui";

function HostPlaceholder() {
    return <div>Host restricted placeholder</div>;
}

const restrictedPlaceholderProvider = vi.fn((_widget: IInsightWidget) => HostPlaceholder);

// `isolate: false` shares one module graph per worker, so the module mocked below may already have
// been evaluated against its real dependencies by a test file that ran earlier in the same worker,
// which would turn the `vi.mock()` call into a no-op.
vi.hoisted(() => {
    vi.resetModules();
});

vi.mock("../../../../dashboardContexts/DashboardComponentsContext.js", () => ({
    useDashboardComponentsContext: () => ({
        RestrictedPlaceholderComponentProvider: restrictedPlaceholderProvider,
    }),
}));

const { CustomError } = await import("./CustomError.js");
const { DataTooLargeError } = await import("./DataTooLargeError.js");
const { NoDataError } = await import("./NoDataError.js");
const { OtherError } = await import("./OtherError.js");

const widget = {
    type: "insight",
    ref: idRef("widget-1"),
    insight: idRef("insight-1", "insight"),
} as IInsightWidget;

const DefaultLocale = "en-US";

const messages = {
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
                <CustomError error={error} widget={widget} forceFullContent />
            </IntlProvider>,
        );
    }

    it.each([
        [
            DataTooLargeToDisplaySdkError.name,
            DataTooLargeError,
            new DataTooLargeToDisplaySdkError(),
            "Data too large Headline",
            "Data too large Text",
            true,
        ],
        [
            DataTooLargeToComputeSdkError.name,
            DataTooLargeError,
            new DataTooLargeToComputeSdkError(),
            "Data too large Headline",
            "Data too large Text",
            true,
        ],
        [NoDataSdkError.name, NoDataError, new NoDataSdkError(), "Empty Headline", "", false],
        [
            UnexpectedSdkError.name,
            OtherError,
            new UnexpectedSdkError(),
            "Other Error Headline",
            "Other Error Text",
            true,
        ],
    ])(
        "should render correct error component for %s error",
        (
            _errorName: string,
            _component: any,
            error: GoodDataSdkError,
            headline: string,
            text: string,
            hasText: boolean,
        ) => {
            renderComponent(error);

            expect(screen.getByText(headline)).toBeInTheDocument();
            expect(hasText === false || screen.queryByText(text) !== null).toBe(true);
        },
    );

    it("renders the host's restricted placeholder for the widget when its data is protected", () => {
        renderComponent(new ProtectedReportSdkError());

        expect(screen.getByText("Host restricted placeholder")).toBeInTheDocument();
        expect(restrictedPlaceholderProvider).toHaveBeenCalledWith(widget);
    });
});
