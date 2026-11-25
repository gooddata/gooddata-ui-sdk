// (C) 2026 GoodData Corporation

import { useIntl } from "react-intl";

import { UiErrorPage } from "@gooddata/sdk-ui-kit";

/**
 * A part the insight needs to open failed to load; it is not a not-found failure.
 * Shown in place of the visualization, like the not-found page. Every part shares one message:
 * the reason (`OpenReportLoadFailure`) stays in the store for diagnostics, the user only needs to
 * know the open can be retried.
 */
export function ReportLoadFailed() {
    const intl = useIntl();

    return (
        <UiErrorPage
            dataTestId="error-report-load-failed"
            title={intl.formatMessage({ id: "dashboard.message.invalid_configuration.header" })}
            description={intl.formatMessage({ id: "dashboard.message.report_load_failed.description" })}
        />
    );
}
