// (C) 2007-2026 GoodData Corporation

import { type IntlShape, useIntl } from "react-intl";

import { UiErrorPage } from "@gooddata/sdk-ui-kit";

import { getGranularityLabel } from "../../models/granularity.js";
import { type IMissingDateFilterItem } from "../../typings/report.js";

export interface IReportNotFoundProps {
    /** the date filter items the insight references but the workspace no longer has */
    missingItems?: ReadonlyArray<IMissingDateFilterItem>;
}

/** "Order date - Minute of Hour", the way a date filter titles a date attribute. */
const formatMissingItem = (item: IMissingDateFilterItem, intl: IntlShape): string =>
    `${item.datasetTitle} - ${item.granularity ? getGranularityLabel(item.granularity, intl) : item.identifier}`;

export function ReportNotFound({ missingItems }: IReportNotFoundProps) {
    const intl = useIntl();

    if (missingItems?.length) {
        return (
            <UiErrorPage
                dataTestId="error-report-not-found"
                title={intl.formatMessage({ id: "dashboard.message.invalid_configuration.header" })}
                description={intl.formatMessage(
                    { id: "dashboard.message.report_not_found.missing_date_filter_items.description" },
                    {
                        items: missingItems.map((item) => formatMissingItem(item, intl)).join(", "),
                        count: missingItems.length,
                    },
                )}
            />
        );
    }

    return (
        <UiErrorPage
            dataTestId="error-report-not-found"
            title={intl.formatMessage({ id: "dashboard.message.report_not_found.header" })}
            description={intl.formatMessage({ id: "dashboard.message.report_not_found.description" })}
        />
    );
}
